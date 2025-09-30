import { AudioData, VisualizerSettings } from '../../App';

export class SpectrumVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private bars: number[] = [];
  private smoothedBars: number[] = [];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  configure(settings: VisualizerSettings) {
    // Configuration will be handled in render method based on settings
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  render(audioData: AudioData, settings: VisualizerSettings) {
    if (!audioData.frequencyData || audioData.frequencyData.length === 0) return;

    const { frequencyData } = audioData;
    const barCount = Math.min(64, frequencyData.length / 4); // Reduce number of bars for better visual
    const barWidth = this.width / barCount;
    const maxHeight = this.height * 0.8;

    // Initialize arrays if needed
    if (this.bars.length !== barCount) {
      this.bars = new Array(barCount).fill(0);
      this.smoothedBars = new Array(barCount).fill(0);
    }

    // Process frequency data into bars
    for (let i = 0; i < barCount; i++) {
      const startIdx = Math.floor((i * frequencyData.length) / barCount / 4);
      const endIdx = Math.floor(((i + 1) * frequencyData.length) / barCount / 4);
      
      let sum = 0;
      for (let j = startIdx; j < endIdx; j++) {
        sum += frequencyData[j];
      }
      
      const average = sum / (endIdx - startIdx);
      this.bars[i] = (average / 255) * maxHeight;
      
      // Smooth the bars for fluid animation
      this.smoothedBars[i] += (this.bars[i] - this.smoothedBars[i]) * 0.3;
    }

    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Get colors based on theme and settings
    const colors = this.getColorScheme(settings.colorScheme);
    
    // Draw bars
    for (let i = 0; i < barCount; i++) {
      const barHeight = this.smoothedBars[i] * settings.sensitivity;
      const x = i * barWidth;
      const y = this.height - barHeight;

      // Create gradient for each bar
      const gradient = this.ctx.createLinearGradient(0, this.height, 0, y);
      const colorIndex = Math.floor((i / barCount) * colors.length);
      const color = colors[colorIndex % colors.length];
      
      gradient.addColorStop(0, `${color}FF`);
      gradient.addColorStop(0.5, `${color}AA`);
      gradient.addColorStop(1, `${color}44`);

      this.ctx.fillStyle = gradient;

      // Draw rounded bars
      this.drawRoundedBar(x + 1, y, barWidth - 2, barHeight, 2);

      // Mirror effect if enabled
      if (settings.mirrorEffect) {
        this.ctx.save();
        this.ctx.scale(1, -1);
        this.ctx.translate(0, -this.height);
        this.ctx.globalAlpha = 0.3;
        this.drawRoundedBar(x + 1, y, barWidth - 2, barHeight, 2);
        this.ctx.restore();
      }

      // Beat pulse effect
      if (settings.beatDetection && audioData.beat) {
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.drawRoundedBar(x + 1, y, barWidth - 2, barHeight, 2);
        this.ctx.shadowBlur = 0;
      }
    }

    // Add subtle particle effects at bar tops
    this.drawParticleEffects(settings, audioData);
  }

  private drawRoundedBar(x: number, y: number, width: number, height: number, radius: number) {
    if (height < radius) {
      radius = height / 2;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y + height);
    this.ctx.lineTo(x + width - radius, y + height);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    this.ctx.lineTo(x + width, y + radius);
    this.ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    this.ctx.lineTo(x + radius, y);
    this.ctx.quadraticCurveTo(x, y, x, y + radius);
    this.ctx.lineTo(x, y + height - radius);
    this.ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawParticleEffects(settings: VisualizerSettings, audioData: AudioData) {
    if (!settings.beatDetection || !audioData.beat) return;

    const particleCount = 10;
    const colors = this.getColorScheme(settings.colorScheme);

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height * 0.3;
      const size = Math.random() * 3 + 1;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.ctx.beginPath();
      this.ctx.arc(x, y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `${color}88`;
      this.ctx.fill();
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
    // Cleanup if needed
  }
}