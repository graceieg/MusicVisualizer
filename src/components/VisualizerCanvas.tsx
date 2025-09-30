import React, { useRef, useEffect, useCallback } from 'react';
import { AudioData, VisualizerSettings } from '../App';
import { SpectrumVisualizer } from './visualizers/SpectrumVisualizer';
import { ParticleVisualizer } from './visualizers/ParticleVisualizer';
import { WaveformVisualizer } from './visualizers/WaveformVisualizer';
import { CircularVisualizer } from './visualizers/CircularVisualizer';
import { AbstractVisualizer } from './visualizers/AbstractVisualizer';

interface VisualizerCanvasProps {
  audioData: AudioData;
  settings: VisualizerSettings;
  isPlaying: boolean;
}

export function VisualizerCanvas({ audioData, settings, isPlaying }: VisualizerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const visualizerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();

  // Initialize and manage visualizer instances
  const initializeVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clean up previous visualizer
    if (visualizerRef.current?.destroy) {
      visualizerRef.current.destroy();
    }

    // Create new visualizer based on mode
    switch (settings.mode) {
      case 'spectrum':
        visualizerRef.current = new SpectrumVisualizer(canvas, ctx);
        break;
      case 'particle':
        visualizerRef.current = new ParticleVisualizer(canvas, ctx);
        break;
      case 'waveform':
        visualizerRef.current = new WaveformVisualizer(canvas, ctx);
        break;
      case 'circular':
        visualizerRef.current = new CircularVisualizer(canvas, ctx);
        break;
      case 'abstract':
        visualizerRef.current = new AbstractVisualizer(canvas, ctx);
        break;
    }

    // Configure visualizer with settings
    if (visualizerRef.current?.configure) {
      visualizerRef.current.configure(settings);
    }
  }, [settings.mode]);

  // Handle canvas resizing
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Notify visualizer of resize
    if (visualizerRef.current?.resize) {
      visualizerRef.current.resize(rect.width, rect.height);
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    if (!isPlaying) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      animationFrameRef.current = requestAnimationFrame(animate);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

    // Render visualizer
    if (visualizerRef.current?.render) {
      visualizerRef.current.render(audioData, settings);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [audioData, settings, isPlaying]);

  // Initialize visualizer when mode changes
  useEffect(() => {
    initializeVisualizer();
  }, [initializeVisualizer]);

  // Setup canvas and start animation
  useEffect(() => {
    resizeCanvas();
    animate();

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (visualizerRef.current?.destroy) {
        visualizerRef.current.destroy();
      }
    };
  }, [resizeCanvas, animate]);

  // Update visualizer settings
  useEffect(() => {
    if (visualizerRef.current?.configure) {
      visualizerRef.current.configure(settings);
    }
  }, [settings]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-gradient-to-br from-background via-background/95 to-muted/20 relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent)] animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,200,255,0.05),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,120,200,0.05),transparent)]" />
      </div>

      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ maxWidth: '1200px', margin: '0 auto', display: 'block' }}
      />

      {/* Loading State */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <p className="text-muted-foreground">Upload an audio file to start visualizing</p>
          </div>
        </div>
      )}

      {/* Beat Flash Effect */}
      {settings.beatDetection && audioData.beat && (
        <div 
          className="absolute inset-0 bg-white/5 pointer-events-none animate-pulse"
          style={{ animationDuration: '0.1s' }}
        />
      )}
    </div>
  );
}