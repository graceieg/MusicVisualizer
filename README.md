# Music Visualizer

An interactive music visualizer web application that transforms audio into captivating visual experiences using React and the Web Audio API.

 **Last Updated**: September 26, 2025  
 
## Overview

This project brings music to life through dynamic visualizations that respond to audio in real-time. Built with modern web technologies, it offers an immersive audio-visual experience with multiple visualization modes and customizable settings.

## Features

- **5 Visualization Modes**:
  - Spectrum Analyzer
  - Particle System
  - Waveform Display
  - Circular Visualizer
  - Abstract Patterns
- **Real-time Audio Analysis** using Web Audio API
- **Beat Detection** with customizable sensitivity
- **Responsive Design** that works on all screen sizes
- **Customizable Settings** including:
  - Color schemes
  - Animation speed
  - Particle count
  - Mirror effects

## Technologies Used

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Audio Processing**: Web Audio API
- **Build Tool**: Vite
- **UI Components**: Radix UI, Lucide Icons

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later) or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/graceieg/MusicVisualizer.git
   cd MusicVisualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```


## Using the Visualizer

1. Click the upload button to select an audio file
2. Use the playback controls to play/pause the audio
3. Toggle between different visualization modes
4. Adjust settings using the control panel
5. Toggle fullscreen mode for an immersive experience

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── visualizers/     # Visualization components
│   └── ui/              # UI component library
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## License

This project is licensed under the MIT License
