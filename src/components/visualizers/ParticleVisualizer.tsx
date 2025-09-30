import { AudioData, VisualizerSettings } from '../../App';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  frequency: number;
}

export class ParticleVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private particles: Particle[] = [];
  private connectionDistance = 80;
  private time = 0;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  configure(settings: VisualizerSettings) {
    // Adjust particle count based on settings
    const targetCount = settings.particleCount;
    if (this.particles.length !== targetCount) {
      this.particles = [];
      this.initializeParticles(targetCount);
    }
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    // Reinitialize particles for new dimensions
    this.initializeParticles(this.particles.length);
  }

  private initializeParticles(count: number) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      life: Math.random() * 200 + 100,
      maxLife: 300,
      color: this.getRandomColor(),
      frequency: Math.random() * 256
    };
  }

  render(audioData: AudioData, settings: VisualizerSettings) {
    if (!audioData.frequencyData || audioData.frequencyData.length === 0) return;

    this.time += 0.016; // Assuming 60fps
    
    // Clear canvas with slight trail effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const { frequencyData } = audioData;
    const colors = this.getColorScheme(settings.colorScheme);

    // Update particles based on audio data
    this.particles.forEach((particle, index) => {
      // Map particle to frequency band
      const freqIndex = Math.floor((particle.frequency / 256) * frequencyData.length);
      const intensity = frequencyData[freqIndex] / 255;

      // Update position based on audio intensity
      const audioInfluence = intensity * settings.sensitivity * 2;
      particle.vx += (Math.random() - 0.5) * audioInfluence * 0.1;
      particle.vy += (Math.random() - 0.5) * audioInfluence * 0.1;

      // Apply some physics
      particle.vx *= 0.98; // Friction
      particle.vy *= 0.98;
      
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary bouncing
      if (particle.x < 0 || particle.x > this.width) {
        particle.vx *= -0.8;
        particle.x = Math.max(0, Math.min(this.width, particle.x));
      }
      if (particle.y < 0 || particle.y > this.height) {
        particle.vy *= -0.8;
        particle.y = Math.max(0, Math.min(this.height, particle.y));
      }

      // Update life and size based on audio
      particle.life -= 1;
      particle.size = Math.max(0.5, 1 + intensity * 3 * settings.sensitivity);

      // Color based on frequency and intensity
      const colorIndex = Math.floor(intensity * colors.length);
      particle.color = colors[Math.min(colorIndex, colors.length - 1)];

      // Respawn particle if it dies
      if (particle.life <= 0) {
        const newParticle = this.createParticle();
        this.particles[index] = newParticle;
      }
    });

    // Draw connections between nearby particles
    this.drawConnections(audioData, settings);

    // Draw particles
    this.particles.forEach(particle => {
      this.drawParticle(particle, audioData, settings);
    });

    // Add beat pulse effect
    if (settings.beatDetection && audioData.beat) {
      this.drawBeatPulse(settings);
    }
  }

  private drawParticle(particle: Particle, audioData: AudioData, settings: VisualizerSettings) {
    const alpha = particle.life / particle.maxLife;
    
    // Glow effect
    this.ctx.save();
    this.ctx.globalAlpha = alpha * 0.3;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
    this.ctx.fillStyle = particle.color;
    this.ctx.fill();
    this.ctx.restore();

    // Main particle
    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fillStyle = particle.color;
    this.ctx.fill();

    // Inner bright core
    this.ctx.globalAlpha = alpha * 0.8;
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawConnections(audioData: AudioData, settings: VisualizerSettings) {
    const { frequencyData } = audioData;
    
    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i];
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const particleB = this.particles[j];
        
        const dx = particleA.x - particleB.x;
        const dy = particleA.y - particleB.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.connectionDistance) {
          // Get audio intensity for connection strength
          const freqIndex = Math.floor(((i + j) / (this.particles.length * 2)) * frequencyData.length);
          const intensity = frequencyData[freqIndex] / 255 * settings.sensitivity;
          
          const alpha = (1 - distance / this.connectionDistance) * intensity * 0.3;
          
          this.ctx.save();
          this.ctx.globalAlpha = alpha;
          this.ctx.strokeStyle = particleA.color;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(particleA.x, particleA.y);
          this.ctx.lineTo(particleB.x, particleB.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }

  private drawBeatPulse(settings: VisualizerSettings) {
    const colors = this.getColorScheme(settings.colorScheme);
    const pulseRadius = Math.min(this.width, this.height) * 0.3;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.2;
    const gradient = this.ctx.createRadialGradient(
      this.width / 2, this.height / 2, 0,
      this.width / 2, this.height / 2, pulseRadius
    );
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(this.width / 2, this.height / 2, pulseRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private getRandomColor(): string {
    const colors = ['#ff0080', '#ff8000', '#ffff00', '#80ff00', '#00ff80', '#0080ff', '#8000ff'];
    return colors[Math.floor(Math.random() * colors.length)];
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
    this.particles = [];
  }
}