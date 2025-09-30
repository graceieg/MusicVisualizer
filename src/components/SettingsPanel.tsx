import React from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { X, Palette, Sliders, Zap, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VisualizerSettings } from '../App';

interface SettingsPanelProps {
  settings: VisualizerSettings;
  onSettingsChange: (settings: Partial<VisualizerSettings>) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onSettingsChange, onClose }: SettingsPanelProps) {
  const colorSchemes = [
    { value: 'rainbow', label: 'Rainbow', colors: ['#ff0080', '#ff8000', '#ffff00', '#80ff00', '#00ff80', '#0080ff', '#8000ff'] },
    { value: 'blue', label: 'Blue Ocean', colors: ['#001f3f', '#0074d9', '#39cccc', '#7fdbff'] },
    { value: 'fire', label: 'Fire', colors: ['#ff4444', '#ff8800', '#ffaa00', '#ffdd00'] },
    { value: 'purple', label: 'Purple Dream', colors: ['#441155', '#663388', '#8855bb', '#aa77dd'] }
  ];

  const qualityOptions = [
    { value: 'low', label: 'Low (Better Performance)' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High (Best Quality)' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-2">
                <Sliders className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Visualizer Settings</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Visualization Mode */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Visualization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mode">Visualization Mode</Label>
                    <Select value={settings.mode} onValueChange={(value: any) => onSettingsChange({ mode: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spectrum">Spectrum Analyzer</SelectItem>
                        <SelectItem value="particle">Particle Network</SelectItem>
                        <SelectItem value="waveform">Waveform</SelectItem>
                        <SelectItem value="circular">Circular</SelectItem>
                        <SelectItem value="abstract">Abstract Art</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quality">Quality</Label>
                    <Select value={settings.quality} onValueChange={(value: any) => onSettingsChange({ quality: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {qualityOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Audio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sensitivity">
                      Sensitivity ({Math.round(settings.sensitivity * 100)}%)
                    </Label>
                    <Slider
                      value={[settings.sensitivity * 100]}
                      onValueChange={([value]) => onSettingsChange({ sensitivity: value / 100 })}
                      max={200}
                      min={10}
                      step={10}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="beat-detection">Beat Detection</Label>
                    <Switch
                      id="beat-detection"
                      checked={settings.beatDetection}
                      onCheckedChange={(checked) => onSettingsChange({ beatDetection: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="mirror-effect">Mirror Effect</Label>
                    <Switch
                      id="mirror-effect"
                      checked={settings.mirrorEffect}
                      onCheckedChange={(checked) => onSettingsChange({ mirrorEffect: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Visual Effects */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Visual Effects</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="color-scheme">Color Scheme</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {colorSchemes.map((scheme) => (
                        <button
                          key={scheme.value}
                          onClick={() => onSettingsChange({ colorScheme: scheme.value })}
                          className={`p-2 rounded-lg border-2 transition-all ${
                            settings.colorScheme === scheme.value
                              ? 'border-primary shadow-md'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium">{scheme.label}</span>
                          </div>
                          <div className="flex space-x-1">
                            {scheme.colors.slice(0, 4).map((color, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 rounded-full flex-1"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {settings.mode === 'particle' && (
                    <div className="space-y-2">
                      <Label htmlFor="particle-count">
                        Particle Count ({settings.particleCount})
                      </Label>
                      <Slider
                        value={[settings.particleCount]}
                        onValueChange={([value]) => onSettingsChange({ particleCount: value })}
                        max={200}
                        min={20}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preset Actions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Presets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onSettingsChange({
                        mode: 'spectrum',
                        colorScheme: 'rainbow',
                        sensitivity: 1.0,
                        beatDetection: true,
                        mirrorEffect: false,
                        particleCount: 100
                      });
                    }}
                  >
                    Classic Spectrum
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onSettingsChange({
                        mode: 'particle',
                        colorScheme: 'blue',
                        sensitivity: 1.2,
                        beatDetection: true,
                        mirrorEffect: false,
                        particleCount: 150
                      });
                    }}
                  >
                    Cosmic Particles
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      onSettingsChange({
                        mode: 'waveform',
                        colorScheme: 'fire',
                        sensitivity: 0.8,
                        beatDetection: true,
                        mirrorEffect: true,
                        particleCount: 100
                      });
                    }}
                  >
                    Fire Waves
                  </Button>

                  <Separator className="my-2" />

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      const randomModes: any[] = ['spectrum', 'particle', 'waveform', 'circular', 'abstract'];
                      const randomColors = ['rainbow', 'blue', 'fire', 'purple'];
                      
                      onSettingsChange({
                        mode: randomModes[Math.floor(Math.random() * randomModes.length)],
                        colorScheme: randomColors[Math.floor(Math.random() * randomColors.length)],
                        sensitivity: 0.5 + Math.random() * 1.0,
                        beatDetection: Math.random() > 0.5,
                        mirrorEffect: Math.random() > 0.7,
                        particleCount: 50 + Math.floor(Math.random() * 150)
                      });
                    }}
                  >
                    🎲 Randomize
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}