import { AudioData, VisualizerSettings } from '../../App';

interface Shape {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'triangle' | 'square' | 'circle' | 'line';
  color: string;
  intensity: number;
}

export class AbstractVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private shapes: Shape[] = [];
  private time = 0;
  private colorPalette: string[] = [];
  private fractalDepth = 3;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.initializeShapes();
  }

  configure(settings: VisualizerSettings) {
    this.colorPalette = this.getColorScheme(settings.colorScheme);
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initializeShapes();
  }

  private initializeShapes() {
    this.shapes = [];
    const shapeCount = 20;
    const types: Shape['type'][] = ['triangle', 'square', 'circle', 'line'];

    for (let i = 0; i < shapeCount; i++) {
      this.shapes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 50 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        type: types[Math.floor(Math.random() * types.length)],
        color: '#ff0080',
        intensity: 0
      });
    }
  }

  render(audioData: AudioData, settings: VisualizerSettings) {
    if (!audioData.frequencyData || audioData.frequencyData.length === 0) return;

    this.time += 0.016;
    const { frequencyData } = audioData;
    const colors = this.getColorScheme(settings.colorScheme);

    // Clear with subtle trail effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw generative background pattern
    this.drawGenerativeBackground(audioData, settings, colors);

    // Update and render shapes
    this.updateShapes(frequencyData, settings, colors);
    this.renderShapes(settings);

    // Draw fractal elements
    this.drawFractalElements(audioData, settings, colors);

    // Color palette transitions
    this.drawColorTransitions(audioData, settings, colors);

    // Beat-based geometric explosions
    if (settings.beatDetection && audioData.beat) {
      this.drawGeometricExplosion(colors, settings);
    }
  }

  private drawGenerativeBackground(audioData: AudioData, settings: VisualizerSettings, colors: string[]) {
    const { frequencyData } = audioData;
    
    // Create flowing gradient based on audio
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, Math.max(this.width, this.height)
    );

    for (let i = 0; i < colors.length; i++) {
      const freqIndex = Math.floor((i / colors.length) * frequencyData.length);
      const intensity = frequencyData[freqIndex] / 255 * settings.sensitivity;
      const alpha = Math.max(0.02, intensity * 0.1);
      
      gradient.addColorStop(i / (colors.length - 1), colors[i] + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
    }

    this.ctx.save();
    this.ctx.fillStyle = gradient;
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  private updateShapes(frequencyData: Uint8Array, settings: VisualizerSettings, colors: string[]) {
    this.shapes.forEach((shape, index) => {
      // Map shape to frequency band
      const freqIndex = Math.floor((index / this.shapes.length) * frequencyData.length);
      const intensity = frequencyData[freqIndex] / 255 * settings.sensitivity;
      
      shape.intensity = intensity;
      shape.rotation += shape.rotationSpeed + intensity * 0.1;
      
      // Update position based on audio
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const radius = 100 + intensity * 150;
      const angle = (index / this.shapes.length) * Math.PI * 2 + this.time * 0.5;
      
      shape.x = centerX + Math.cos(angle) * radius + Math.sin(this.time + index) * 50;
      shape.y = centerY + Math.sin(angle) * radius + Math.cos(this.time + index) * 50;
      shape.size = 10 + intensity * 40;
      
      // Color transitions
      const colorIndex = Math.floor(intensity * colors.length);
      shape.color = colors[Math.min(colorIndex, colors.length - 1)];
    });
  }

  private renderShapes(settings: VisualizerSettings) {
    this.shapes.forEach(shape => {
      if (shape.intensity < 0.1) return;

      this.ctx.save();
      this.ctx.translate(shape.x, shape.y);
      this.ctx.rotate(shape.rotation);
      this.ctx.fillStyle = shape.color;
      this.ctx.strokeStyle = shape.color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = shape.intensity;

      // Add glow effect
      this.ctx.shadowColor = shape.color;
      this.ctx.shadowBlur = 20;

      switch (shape.type) {
        case 'triangle':
          this.drawTriangle(shape.size);
          break;
        case 'square':
          this.drawSquare(shape.size);
          break;
        case 'circle':
          this.drawCircle(shape.size);
          break;
        case 'line':
          this.drawLine(shape.size);
          break;
      }

      this.ctx.restore();
    });
  }

  private drawTriangle(size: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size);
    this.ctx.lineTo(-size * 0.866, size * 0.5);
    this.ctx.lineTo(size * 0.866, size * 0.5);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawSquare(size: number) {
    this.ctx.beginPath();
    this.ctx.rect(-size / 2, -size / 2, size, size);
    this.ctx.fill();
    this.ctx.stroke();
  }

  private drawCircle(size: number) {
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawLine(size: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(-size / 2, 0);
    this.ctx.lineTo(size / 2, 0);
    this.ctx.stroke();
  }

  private drawFractalElements(audioData: AudioData, settings: VisualizerSettings, colors: string[]) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const baseSize = 100 + audioData.volume * 200 * settings.sensitivity;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.time * 0.1);
    
    this.drawFractalBranch(0, 0, baseSize, 0, this.fractalDepth, colors[0], settings);
    
    this.ctx.restore();
  }

  private drawFractalBranch(
    x: number, 
    y: number, 
    length: number, 
    angle: number, 
    depth: number, 
    color: string,
    settings: VisualizerSettings
  ) {
    if (depth <= 0 || length < 5) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;

    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = depth;
    this.ctx.globalAlpha = 0.6;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();
    this.ctx.restore();

    // Recursive branches
    const newLength = length * 0.6;
    const newDepth = depth - 1;
    const angleOffset = Math.PI / 4 + Math.sin(this.time) * 0.5;

    this.drawFractalBranch(endX, endY, newLength, angle - angleOffset, newDepth, color, settings);
    this.drawFractalBranch(endX, endY, newLength, angle + angleOffset, newDepth, color, settings);
  }

  private drawColorTransitions(audioData: AudioData, settings: VisualizerSettings, colors: string[]) {
    // Create flowing color bands
    const bandCount = 5;
    const bandHeight = this.height / bandCount;

    for (let i = 0; i < bandCount; i++) {
      const freqIndex = Math.floor((i / bandCount) * audioData.frequencyData.length);
      const intensity = audioData.frequencyData[freqIndex] / 255 * settings.sensitivity;
      
      if (intensity < 0.1) continue;

      const gradient = this.ctx.createLinearGradient(0, i * bandHeight, this.width, i * bandHeight);
      const color = colors[i % colors.length];
      
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, color + '20');
      gradient.addColorStop(1, 'transparent');

      this.ctx.save();
      this.ctx.fillStyle = gradient;
      this.ctx.globalCompositeOperation = 'overlay';
      this.ctx.fillRect(0, i * bandHeight, this.width, bandHeight);
      this.ctx.restore();
    }
  }

  private drawGeometricExplosion(colors: string[], settings: VisualizerSettings) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const explosionRadius = Math.min(this.width, this.height) * 0.4;
    const shapeCount = 12;

    for (let i = 0; i < shapeCount; i++) {
      const angle = (i / shapeCount) * Math.PI * 2;
      const distance = explosionRadius * (0.5 + Math.random() * 0.5);
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const size = 10 + Math.random() * 20;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle);
      this.ctx.fillStyle = colors[i % colors.length];
      this.ctx.globalAlpha = 0.7;

      // Draw random geometric shape
      const shapeType = Math.floor(Math.random() * 3);
      switch (shapeType) {
        case 0:
          this.drawTriangle(size);
          break;
        case 1:
          this.drawSquare(size);
          break;
        case 2:
          this.drawCircle(size);
          break;
      }

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
    this.shapes = [];
  }
}