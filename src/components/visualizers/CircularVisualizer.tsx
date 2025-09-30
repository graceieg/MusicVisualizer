import { AudioData, VisualizerSettings } from '../../App';

export class CircularVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private rotation = 0;
  private rings: { radius: number; intensity: number; color: string }[] = [];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.initializeRings();
  }

  configure(settings: VisualizerSettings) {
    // Configuration handled in render method
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeRings();
  }

  private initializeRings() {
    this.rings = [];
    const ringCount = 6;
    const maxRadius = Math.min(this.width, this.height) * 0.4;
    
    for (let i = 0; i < ringCount; i++) {
      this.rings.push({
        radius: (i + 1) * (maxRadius / ringCount),
        intensity: 0,
        color: '#ff0080'
      });
    }
  }

  render(audioData: AudioData, settings: VisualizerSettings) {
    if (!audioData.frequencyData || audioData.frequencyData.length === 0) return;

    const { frequencyData } = audioData;
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const colors = this.getColorScheme(settings.colorScheme);

    // Update rotation
    this.rotation += 0.01 + (audioData.volume * 0.05);

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw background rings
    this.drawBackgroundRings(centerX, centerY, colors);

    // Update ring intensities based on frequency bands
    this.updateRingIntensities(frequencyData, settings, colors);

    // Draw frequency rings
    this.drawFrequencyRings(centerX, centerY, settings);

    // Draw radial bars
    this.drawRadialBars(audioData, centerX, centerY, settings, colors);

    // Draw rotating elements
    this.drawRotatingElements(audioData, centerX, centerY, settings, colors);

    // Beat pulse effect
    if (settings.beatDetection && audioData.beat) {
      this.drawBeatPulse(centerX, centerY, colors, settings);
    }
  }

  private drawBackgroundRings(centerX: number, centerY: number, colors: string[]) {
    this.rings.forEach((ring, index) => {
      this.ctx.save();
      this.ctx.globalAlpha = 0.1;
      this.ctx.strokeStyle = colors[index % colors.length];
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  private updateRingIntensities(frequencyData: Uint8Array, settings: VisualizerSettings, colors: string[]) {
    this.rings.forEach((ring, index) => {
      // Map ring to frequency band (bass to treble)
      const startIdx = Math.floor((index / this.rings.length) * frequencyData.length);
      const endIdx = Math.floor(((index + 1) / this.rings.length) * frequencyData.length);
      
      let sum = 0;
      for (let i = startIdx; i < endIdx; i++) {
        sum += frequencyData[i];
      }
      
      const average = sum / (endIdx - startIdx);
      ring.intensity = (average / 255) * settings.sensitivity;
      ring.color = colors[index % colors.length];
    });
  }

  private drawFrequencyRings(centerX: number, centerY: number, settings: VisualizerSettings) {
    this.rings.forEach((ring, index) => {
      if (ring.intensity < 0.1) return;

      const pulseRadius = ring.radius + (ring.intensity * 20);
      const alpha = ring.intensity * 0.8;

      // Main ring
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = ring.color;
      this.ctx.lineWidth = 3 + ring.intensity * 5;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();

      // Glow effect
      this.ctx.save();
      this.ctx.globalAlpha = alpha * 0.3;
      this.ctx.strokeStyle = ring.color;
      this.ctx.lineWidth = 8 + ring.intensity * 10;
      this.ctx.shadowColor = ring.color;
      this.ctx.shadowBlur = 20;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  private drawRadialBars(
    audioData: AudioData, 
    centerX: number, 
    centerY: number, 
    settings: VisualizerSettings, 
    colors: string[]
  ) {
    const { frequencyData } = audioData;
    const barCount = 64;
    const innerRadius = 60;
    const maxBarLength = Math.min(this.width, this.height) * 0.3;

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2 + this.rotation;
      const freqIndex = Math.floor((i / barCount) * frequencyData.length);
      const intensity = (frequencyData[freqIndex] / 255) * settings.sensitivity;
      
      if (intensity < 0.05) continue;

      const barLength = intensity * maxBarLength;
      const startX = centerX + Math.cos(angle) * innerRadius;
      const startY = centerY + Math.sin(angle) * innerRadius;
      const endX = centerX + Math.cos(angle) * (innerRadius + barLength);
      const endY = centerY + Math.sin(angle) * (innerRadius + barLength);

      // Color based on frequency
      const colorIndex = Math.floor((i / barCount) * colors.length);
      const color = colors[colorIndex];

      this.ctx.save();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = intensity;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      // Add glow
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 10;
      this.ctx.stroke();
      this.ctx.restore();
    }
  }

  private drawRotatingElements(
    audioData: AudioData,
    centerX: number,
    centerY: number,
    settings: VisualizerSettings,
    colors: string[]
  ) {
    const elementCount = 8;
    const radius = Math.min(this.width, this.height) * 0.25;

    for (let i = 0; i < elementCount; i++) {
      const angle = (i / elementCount) * Math.PI * 2 + this.rotation * 0.5;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      // Size based on overall volume
      const size = 3 + audioData.volume * 10 * settings.sensitivity;
      const color = colors[i % colors.length];

      this.ctx.save();
      this.ctx.fillStyle = color;
      this.ctx.globalAlpha = 0.7;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fill();

      // Inner bright core
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = 0.9;
      this.ctx.beginPath();
      this.ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      // Connect elements with lines
      if (i > 0) {
        const prevAngle = ((i - 1) / elementCount) * Math.PI * 2 + this.rotation * 0.5;
        const prevX = centerX + Math.cos(prevAngle) * radius;
        const prevY = centerY + Math.sin(prevAngle) * radius;

        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.moveTo(prevX, prevY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.ctx.restore();
      }
    }
  }

  private drawBeatPulse(centerX: number, centerY: number, colors: string[], settings: VisualizerSettings) {
    const pulseRadius = Math.min(this.width, this.height) * 0.5;

    // Expanding circle
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.strokeStyle = colors[0];
    this.ctx.lineWidth = 5;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, pulseRadius * 0.8, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();

    // Radial burst
    const burstLines = 16;
    for (let i = 0; i < burstLines; i++) {
      const angle = (i / burstLines) * Math.PI * 2;
      const startRadius = pulseRadius * 0.3;
      const endRadius = pulseRadius * 0.7;
      
      const startX = centerX + Math.cos(angle) * startRadius;
      const startY = centerY + Math.sin(angle) * startRadius;
      const endX = centerX + Math.cos(angle) * endRadius;
      const endY = centerY + Math.sin(angle) * endRadius;

      this.ctx.save();
      this.ctx.strokeStyle = colors[i % colors.length];
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = 0.6;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
      this.ctx.restore();
    }
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
    this.rings = [];
  }
}