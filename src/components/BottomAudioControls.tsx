import React from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { 
  Volume2, 
  VolumeX, 
  BarChart3, 
  Activity, 
  Waves, 
  CircleDot,
  Palette
} from 'lucide-react';
import { motion } from 'motion/react';
import { TrackInfo, VisualizationMode } from '../App';

interface BottomAudioControlsProps {
  currentTrack: TrackInfo;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  visualizationMode: VisualizationMode;
  onModeChange: (mode: VisualizationMode) => void;
}

export function BottomAudioControls({
  currentTrack,
  volume,
  onVolumeChange,
  onSeek,
  visualizationMode,
  onModeChange
}: BottomAudioControlsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeIcon = (mode: VisualizationMode) => {
    switch (mode) {
      case 'spectrum': return <BarChart3 className="w-4 h-4" />;
      case 'particle': return <CircleDot className="w-4 h-4" />;
      case 'waveform': return <Activity className="w-4 h-4" />;
      case 'circular': return <CircleDot className="w-4 h-4" />;
      case 'abstract': return <Palette className="w-4 h-4" />;
    }
  };

  const visualizationModes: { mode: VisualizationMode; label: string }[] = [
    { mode: 'spectrum', label: 'Spectrum' },
    { mode: 'particle', label: 'Particle' },
    { mode: 'waveform', label: 'Waveform' },
    { mode: 'circular', label: 'Circular' },
    { mode: 'abstract', label: 'Abstract' }
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-background/80 backdrop-blur-md border-t border-border/50"
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
        {/* Left: Track Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {currentTrack.albumArt ? (
              <img 
                src={currentTrack.albumArt} 
                alt="Album Art" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Waves className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{currentTrack.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Center: Progress Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTrack.currentTime)}
            </span>
            
            <div className="flex-1">
              <Slider
                value={[currentTrack.currentTime]}
                max={currentTrack.duration || 100}
                step={1}
                onValueChange={([value]) => onSeek(value)}
                className="w-full"
              />
            </div>
            
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(currentTrack.duration)}
            </span>
          </div>
        </div>

        {/* Right: Volume and Visualization Mode */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {/* Visualization Mode Selector */}
          <div className="flex items-center space-x-1 bg-muted/50 rounded-lg p-1">
            {visualizationModes.map(({ mode, label }) => (
              <Button
                key={mode}
                variant={visualizationMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => onModeChange(mode)}
                className="w-8 h-8 p-0 rounded-md"
                title={label}
              >
                {getModeIcon(mode)}
              </Button>
            ))}
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.7)}
              className="w-8 h-8 p-0"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <div className="w-20">
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={([value]) => onVolumeChange(value / 100)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}