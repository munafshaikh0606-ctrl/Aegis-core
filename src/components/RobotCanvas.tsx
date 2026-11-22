import React, { useEffect, useRef } from 'react';
import { RobotHeadController } from './RobotHeadModel';
import { EmotionState, ThemeColors } from '../types';

interface RobotCanvasProps {
  emotion: EmotionState;
  theme: ThemeColors;
  audioLevel: number;
  wireframe: boolean;
  mouseTracking: boolean;
  onScanTriggered?: () => void;
}

export const RobotCanvas: React.FC<RobotCanvasProps> = ({
  emotion,
  theme,
  audioLevel,
  wireframe,
  mouseTracking,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<RobotHeadController | null>(null);

  // Initialize Three.js 3D Robot Head
  useEffect(() => {
    if (!containerRef.current) return;

    const controller = new RobotHeadController(containerRef.current);
    controllerRef.current = controller;

    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, []);

  // Update Emotion
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setEmotion(emotion);
    }
  }, [emotion]);

  // Update Theme
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setTheme(theme);
    }
  }, [theme]);

  // Update Audio Frequency Level
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setAudioLevel(audioLevel);
    }
  }, [audioLevel]);

  // Update Wireframe mode
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setWireframe(wireframe);
    }
  }, [wireframe]);

  // Update Mouse Tracking
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.setMouseTracking(mouseTracking);
    }
  }, [mouseTracking]);

  return (
    <div className="relative w-full h-full min-h-[380px] md:min-h-[500px] flex items-center justify-center overflow-hidden bg-[#16181D]/80 backdrop-blur-md border border-white/10 shadow-2xl">
      {/* Radial ambient glow matching AEGIS CORE design */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,62,0,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Futuristic Floor Fade */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#0D0E12] to-transparent pointer-events-none" />

      {/* Hologram Reticle Lines Overlay */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border border-dashed border-white/10 animate-[spin_60s_linear_infinite]" />
        <div className="w-60 h-60 md:w-80 md:h-80 rounded-full border border-white/5 animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      {/* Facial Emotion State Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-[#0D0E12]/90 border border-white/10 text-[10px] text-[#D1D5DB] font-mono tracking-widest uppercase backdrop-blur-md">
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
        EXPRESSION: <span className="font-syne font-bold text-white">{emotion}</span>
      </div>

      {/* Audio Waveform Indicator */}
      {audioLevel > 0.05 && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-1 pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-1 transition-all duration-75"
              style={{
                height: `${Math.max(4, Math.min(40, audioLevel * 50 * Math.sin((i + 1) * 0.8)))}px`,
                backgroundColor: theme.primary,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
