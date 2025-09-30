import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TopControlPanel } from './components/TopControlPanel';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { BottomAudioControls } from './components/BottomAudioControls';
import { SettingsPanel } from './components/SettingsPanel';
import { AudioProcessor } from './components/AudioProcessor';

export type VisualizationMode = 'spectrum' | 'particle' | 'waveform' | 'circular' | 'abstract';

export type ThemeMode = 'dark' | 'light' | 'auto';

export interface AudioData {
  frequencyData: Uint8Array;
  timeDomainData: Uint8Array;
  volume: number;
  beat: boolean;
}

export interface TrackInfo {
  title: string;
  artist: string;
  albumArt?: string;
  duration: number;
  currentTime: number;
}

export interface VisualizerSettings {
  mode: VisualizationMode;
  theme: ThemeMode;
  quality: 'low' | 'medium' | 'high';
  beatDetection: boolean;
  mirrorEffect: boolean;
  particleCount: number;
  colorScheme: string;
  sensitivity: number;
}

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<TrackInfo>({
    title: 'No track selected',
    artist: 'Unknown Artist',
    duration: 0,
    currentTime: 0
  });
  const [volume, setVolume] = useState(0.7);
  const [audioData, setAudioData] = useState<AudioData>({
    frequencyData: new Uint8Array(256),
    timeDomainData: new Uint8Array(256),
    volume: 0,
    beat: false
  });
  const [settings, setSettings] = useState<VisualizerSettings>({
    mode: 'spectrum',
    theme: 'dark',
    quality: 'high',
    beatDetection: true,
    mirrorEffect: false,
    particleCount: 100,
    colorScheme: 'rainbow',
    sensitivity: 0.8
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioProcessorRef = useRef<AudioProcessor | null>(null);

  // Initialize audio processor
  useEffect(() => {
    if (audioRef.current && !audioProcessorRef.current) {
      audioProcessorRef.current = new AudioProcessor(audioRef.current);
      audioProcessorRef.current.onDataUpdate = setAudioData;
    }
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const handlePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioProcessorRef.current?.pause();
      } else {
        audioRef.current.play();
        audioProcessorRef.current?.resume();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioProcessorRef.current?.pause();
      setIsPlaying(false);
      setCurrentTrack(prev => ({ ...prev, currentTime: 0 }));
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    if (audioRef.current) {
      const url = URL.createObjectURL(file);
      audioRef.current.src = url;
      setCurrentTrack({
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Local File',
        duration: 0,
        currentTime: 0
      });
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setCurrentTrack(prev => ({
          ...prev,
          duration: audioRef.current?.duration || 0
        }));
      });
    }
  }, []);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTrack(prev => ({ ...prev, currentTime: time }));
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTrack(prev => ({
        ...prev,
        currentTime: audio.currentTime
      }));
    };

    audio.addEventListener('timeupdate', updateTime);
    return () => audio.removeEventListener('timeupdate', updateTime);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VisualizerSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return (
    <div className="h-screen bg-background text-foreground overflow-hidden relative">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />
      
      {/* Top Control Panel */}
      <TopControlPanel
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        onSettingsClick={() => setShowSettings(true)}
        onFullscreenToggle={toggleFullscreen}
        isFullscreen={isFullscreen}
        onFileUpload={handleFileUpload}
        theme={settings.theme}
        onThemeChange={(theme) => updateSettings({ theme })}
      />

      {/* Main Visualizer Canvas */}
      <div className="absolute inset-0 pt-16 pb-20">
        <VisualizerCanvas
          audioData={audioData}
          settings={settings}
          isPlaying={isPlaying}
        />
      </div>

      {/* Bottom Audio Controls */}
      <BottomAudioControls
        currentTrack={currentTrack}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onSeek={handleSeek}
        visualizationMode={settings.mode}
        onModeChange={(mode) => updateSettings({ mode })}
      />

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}