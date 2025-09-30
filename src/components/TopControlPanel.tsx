import React, { useRef } from 'react';
import { Button } from './ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward,
  Settings,
  Maximize,
  Minimize,
  Upload,
  Music,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeMode } from '../App';

interface TopControlPanelProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onSettingsClick: () => void;
  onFullscreenToggle: () => void;
  isFullscreen: boolean;
  onFileUpload: (file: File) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export function TopControlPanel({
  isPlaying,
  onPlayPause,
  onStop,
  onSettingsClick,
  onFullscreenToggle,
  isFullscreen,
  onFileUpload,
  theme,
  onThemeChange
}: TopControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onFileUpload(file);
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const cycleTheme = () => {
    const themes: ThemeMode[] = ['auto', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex]);
  };

  return (
    <motion.div 
      className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border/50"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
        {/* Left: Logo and Title */}
        <div className="flex items-center space-x-4">
          <motion.div
            className="flex items-center space-x-2"
            animate={{ 
              scale: isPlaying ? [1, 1.05, 1] : 1,
            }}
            transition={{ 
              duration: 0.6, 
              repeat: isPlaying ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold">SoundScope</h1>
          </motion.div>
        </div>

        {/* Center: Transport Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="w-10 h-10 rounded-full"
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={onPlayPause}
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onStop}
            className="w-10 h-10 rounded-full"
          >
            <Square className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
            className="w-10 h-10 rounded-full"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Right: User Controls */}
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full"
            title="Upload Audio File"
          >
            <Upload className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={cycleTheme}
            className="w-10 h-10 rounded-full"
            title={`Current: ${theme}`}
          >
            {getThemeIcon()}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFullscreenToggle}
            className="w-10 h-10 rounded-full"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="w-10 h-10 rounded-full"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}