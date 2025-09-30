import { AudioData } from '../App';

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private frequencyData: Uint8Array;
  private timeDomainData: Uint8Array;
  private animationFrame: number | null = null;
  private isProcessing = false;
  
  // Beat detection properties
  private bassHistory: number[] = [];
  private beatThreshold = 1.2;  // More sensitive beat detection
  private lastBeatTime = 0;
  private minBeatInterval = 200; // ms - Allow faster beats

  public onDataUpdate: ((data: AudioData) => void) | null = null;

  constructor(audioElement: HTMLAudioElement) {
    this.initializeAudioContext(audioElement);
    this.frequencyData = new Uint8Array(256);
    this.timeDomainData = new Uint8Array(256);
  }

  private async initializeAudioContext(audioElement: HTMLAudioElement) {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = 256;  // Smaller FFT for faster processing
      this.analyser.smoothingTimeConstant = 0.5;  // Less smoothing for more responsiveness
      this.analyser.minDecibels = -90;
      this.analyser.maxDecibels = -10;

      // Create source and connect
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      // Initialize arrays with correct size
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeDomainData = new Uint8Array(this.analyser.frequencyBinCount);

      this.startProcessing();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  private startProcessing() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.processAudioData();
  }

  private processAudioData = () => {
    if (!this.analyser || !this.onDataUpdate) {
      this.animationFrame = requestAnimationFrame(this.processAudioData);
      return;
    }

    // Get frequency and time domain data
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.timeDomainData);

    // Calculate volume (RMS)
    const volume = this.calculateVolume(this.timeDomainData);

    // Detect beats
    const beat = this.detectBeat();

    // Update callback with processed data
    this.onDataUpdate({
      frequencyData: this.frequencyData.slice(),
      timeDomainData: this.timeDomainData.slice(),
      volume,
      beat
    });

    this.animationFrame = requestAnimationFrame(this.processAudioData);
  };

  private calculateVolume(timeDomainData: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const sample = (timeDomainData[i] - 128) / 128;
      sum += sample * sample;
    }
    return Math.sqrt(sum / timeDomainData.length);
  }

  private detectBeat(): boolean {
    if (!this.frequencyData) return false;

    // Focus on bass frequencies (roughly 20-200 Hz)
    // For a 256 FFT with 44.1kHz sample rate, this is roughly bins 0-10
    // Slightly wider bass range with smaller FFT
    const bassEnd = Math.min(12, this.frequencyData.length);
    let bassSum = 0;
    
    for (let i = 0; i < bassEnd; i++) {
      bassSum += this.frequencyData[i];
    }
    
    const bassAverage = bassSum / bassEnd;
    
    // Keep a history of bass levels
    this.bassHistory.push(bassAverage);
    if (this.bassHistory.length > 43) { // ~1 second of history at 60fps
      this.bassHistory.shift();
    }

    // Calculate average of recent bass levels
    const recentAverage = this.bassHistory.reduce((a, b) => a + b, 0) / this.bassHistory.length;
    
    // Beat detection: current bass level is significantly higher than recent average
    const now = Date.now();
    const timeSinceLastBeat = now - this.lastBeatTime;
    
    if (bassAverage > recentAverage * this.beatThreshold && 
        timeSinceLastBeat > this.minBeatInterval) {
      this.lastBeatTime = now;
      return true;
    }
    
    return false;
  }

  public pause() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  public resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
    if (!this.animationFrame) {
      this.startProcessing();
    }
  }

  public destroy() {
    this.pause();
    this.isProcessing = false;
    
    if (this.source) {
      this.source.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}