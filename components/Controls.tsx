import React from 'react';
import { ParticleShape } from '../types';

interface ControlsProps {
  currentShape: ParticleShape;
  setShape: (s: ParticleShape) => void;
  color: string;
  setColor: (c: string) => void;
  isHandsDetected: boolean;
  isCameraEnabled: boolean;
  setIsCameraEnabled: (enabled: boolean) => void;
}

const SHAPES = [
  { id: ParticleShape.HEART, label: 'Heart', icon: '❤️' },
  { id: ParticleShape.FLOWER, label: 'Flower', icon: '🌸' },
  { id: ParticleShape.SATURN, label: 'Saturn', icon: '🪐' },
  { id: ParticleShape.BUDDHA, label: 'Buddha', icon: '🧘' },
  { id: ParticleShape.FIREWORKS, label: 'Fireworks', icon: '🎆' },
];

const COLORS = [
  '#ffffff', // White
  '#ff4444', // Red
  '#44ff44', // Green
  '#4444ff', // Blue
  '#ffcc00', // Gold
  '#ff00ff', // Magenta
  '#00ffff', // Cyan
];

const Controls: React.FC<ControlsProps> = ({ 
  currentShape, 
  setShape, 
  color, 
  setColor, 
  isHandsDetected,
  isCameraEnabled,
  setIsCameraEnabled
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="absolute top-0 right-0 h-full p-6 flex flex-col justify-center pointer-events-none z-40">
      <div className="bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl w-72 pointer-events-auto transition-all hover:bg-black/50">
        
        {/* Header */}
        <div className="mb-6 border-b border-white/10 pb-4">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Particle Soul
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <span className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${isHandsDetected ? 'bg-green-500 text-green-500 animate-pulse' : isCameraEnabled ? 'bg-red-500 text-red-500' : 'bg-gray-500 text-gray-500'}`}></span>
                <p className="text-xs text-gray-400 font-medium">
                  {!isCameraEnabled ? 'Camera Disabled' : isHandsDetected ? 'System Active' : 'Waiting for hands...'}
                </p>
            </div>
        </div>

        {/* Shapes */}
        <div className="mb-6">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            Select Template
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setShape(shape.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  currentShape === shape.id
                    ? 'bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <span className="text-base">{shape.icon}</span>
                <span>{shape.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="mb-8">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
            Color Essence
          </label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-125 focus:outline-none ring-2 ring-offset-2 ring-offset-black ring-transparent shadow-lg ${
                    color === c ? '!ring-white scale-110' : ''
                }`}
                style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}40` }}
              />
            ))}
            <div className="relative">
                <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-6 h-6 rounded-full opacity-0 absolute cursor-pointer"
                />
                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 text-white/50 text-xs pointer-events-none">
                    +
                </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
            <button
              onClick={() => setIsCameraEnabled(!isCameraEnabled)}
              className={`w-full py-3 rounded-lg text-sm font-medium transition-all border shadow-lg active:scale-95 ${
                isCameraEnabled 
                  ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
              }`}
            >
              {isCameraEnabled ? 'Stop Camera' : 'Start Camera'}
            </button>

            <button
              onClick={toggleFullscreen}
              className="w-full py-3 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 text-gray-300 text-sm font-medium hover:from-gray-700 hover:to-gray-800 transition-all border border-white/5 shadow-lg active:scale-95"
            >
              Toggle Fullscreen
            </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5 backdrop-blur-sm">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Gesture Guide</h3>
            <ul className="text-[11px] text-gray-400 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                    <span className="text-lg leading-none">↔️</span>
                    <span><strong>Distance:</strong> Thumb-pinky width controls size.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-lg leading-none">🔄</span>
                    <span><strong>Rotate:</strong> Tilt wrist like turning a knob.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-lg leading-none">✊</span>
                    <span><strong>Fist:</strong> Close hand to <span className="text-blue-400">condense/gather</span> particles.</span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="text-lg leading-none">🖐️</span>
                    <span><strong>Palm:</strong> Open hand to <span className="text-red-400">explode/scatter</span>.</span>
                </li>
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Controls;