import { AudioData, VisualizerSettings } from '../../App';

export class WaveformVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private waveHistory: number[][] = [];
  private maxHistory = 60; // Store last 60 frames for trailing effect

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  configure(settings: VisualizerSettings) {
    // Configuration handled in render method
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  render(audioData: AudioData, settings: VisualizerSettings) {
    if (!audioData.timeDomainData || audioData.timeDomainData.length === 0) return;

    const { timeDomainData, frequencyData } = audioData;
    
    // Store current waveform in history
    const currentWave = Array.from(timeDomainData);
    this.waveHistory.unshift(currentWave);
    if (this.waveHistory.length > this.maxHistory) {
      this.waveHistory.pop();
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    const colors = this.getColorScheme(settings.colorScheme);
    const centerY = this.height / 2;

    // Draw trailing waveforms with decreasing opacity
    this.waveHistory.forEach((waveData, historyIndex) => {
      const alpha = (this.maxHistory - historyIndex) / this.maxHistory;
      this.drawWaveform(waveData, alpha * 0.3, colors[0], centerY + historyIndex * 2, settings);
    });

    // Draw main waveform
    this.drawMainWaveform(timeDomainData, frequencyData, colors, centerY, settings);

    // Draw dual channel if enabled (simulate stereo)
    if (settings.mirrorEffect) {
      this.drawMirroredWaveform(timeDomainData, frequencyData, colors, centerY, settings);
    }

    // Beat pulse effect
    if (settings.beatDetection && audioData.beat) {
      this.drawBeatEffect(colors, settings);
    }
  }

  private drawMainWaveform(
    timeDomainData: Uint8Array, 
    frequencyData: Uint8Array,
    colors: string[], 
    centerY: number, 
    settings: VisualizerSettings
  ) {
    const sliceWidth = this.width / timeDomainData.length;
    
    // Create gradient based on frequency data
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    for (let i = 0; i < colors.length; i++) {
      gradient.addColorStop(i / (colors.length - 1), colors[i]);
    }

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Draw smooth waveform
    this.ctx.beginPath();
    let x = 0;
    let firstPoint = true;

    for (let i = 0; i < timeDomainData.length; i++) {
      const value = (timeDomainData[i] / 128.0 - 1.0) * settings.sensitivity;
      const y = centerY + (value * this.height * 0.3);

      if (firstPoint) {
        this.ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        // Use quadratic curves for smooth lines
        const prevX = (i - 1) * sliceWidth;
        const controlX = (prevX + x) / 2;
        this.ctx.quadraticCurveTo(controlX, centerY, x, y);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();

    // Add glow effect
    this.ctx.save();
    this.ctx.shadowColor = colors[0];
    this.ctx.shadowBlur = 20;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawMirroredWaveform(
    timeDomainData: Uint8Array,
    frequencyData: Uint8Array,
    colors: string[],
    centerY: number,
    settings: VisualizerSettings
  ) {
    const sliceWidth = this.width / timeDomainData.length;
    
    // Different color for mirrored wave
    const mirrorColor = colors[1] || colors[0];
    this.ctx.strokeStyle = mirrorColor + '80'; // Semi-transparent
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    let x = 0;
    let firstPoint = true;

    for (let i = 0; i < timeDomainData.length; i++) {
      // Invert and offset the waveform
      const value = -(timeDomainData[i] / 128.0 - 1.0) * settings.sensitivity * 0.7;
      const y = centerY + (value * this.height * 0.3);

      if (firstPoint) {
        this.ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        const prevX = (i - 1) * sliceWidth;
        const controlX = (prevX + x) / 2;
        this.ctx.quadraticCurveTo(controlX, centerY, x, y);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();
  }

  private drawWaveform(
    waveData: number[],
    alpha: number,
    color: string,
    offsetY: number,
    settings: VisualizerSettings
  ) {
    if (alpha <= 0.01) return;

    const sliceWidth = this.width / waveData.length;
    
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    let x = 0;

    for (let i = 0; i < waveData.length; i++) {
      const value = (waveData[i] / 128.0 - 1.0) * settings.sensitivity * 0.5;
      const y = offsetY + (value * this.height * 0.2);

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawBeatEffect(colors: string[], settings: VisualizerSettings) {
    // Draw expanding circles on beat
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const maxRadius = Math.min(this.width, this.height) * 0.4;

    for (let i = 0; i < 3; i++) {
      const radius = (i + 1) * maxRadius / 3;
      const alpha = (3 - i) / 3 * 0.3;

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = colors[i % colors.length];
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Add radial gradient flash
    this.ctx.save();
    this.ctx.globalAlpha = 0.1;
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxRadius
    );
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private getColorScheme(scheme: string): string[] {
    switch (scheme) {
      case 'rainbow':
        return ['#ff0080', '#ff8000', '#ffff00', '#80ff00', '#00ff80', '#0080ff', '#8000ff'];
      case 'blue':
        return ['#001f3f', '#0074d9', '#39cccc', '#7fdbff'];
      case 'fire':
        return ['#ff4444', '#ff8800', '#ffaa00', '#ffdd00'];
      case 'purple':
        return ['#441155', '#663388', '#8855bb', '#aa77dd'];
      default:
        return ['#ff0080', '#ff8000', '#ffff00', '#80ff00', '#00ff80', '#0080ff', '#8000ff'];
    }
  }

  destroy() {
    this.waveHistory = [];
  }
}