export type EmotionState =
  | 'neutral'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'happy'
  | 'alert'
  | 'focused'
  | 'surprised'
  | 'confused'
  | 'glitch';

export type ThemeMode = 'cyan' | 'crimson' | 'emerald' | 'amber' | 'violet';

export type SystemAction =
  | 'scan'
  | 'theme_cyan'
  | 'theme_crimson'
  | 'theme_emerald'
  | 'theme_amber'
  | 'theme_violet'
  | 'security_alert'
  | 'none';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: Date;
  emotion?: EmotionState;
  statusMessage?: string;
  action?: SystemAction;
}

export interface RobotFaceSettings {
  wireframe: boolean;
  autoRotate: boolean;
  particleDensity: number;
  glowIntensity: number;
  voiceSensitivity: number;
  speechRate: number;
  speechPitch: number;
  voiceName: string;
  enableVoiceOutput: boolean;
  soundEffects: boolean;
  trackingMouse: boolean;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  quantumCoherence: number;
  audioFrequency: number;
  fps: number;
  latencyMs: number;
  recognizedCommand: string;
}

export interface ThemeColors {
  name: string;
  primary: string; // e.g. #00f0ff
  secondary: string; // e.g. #00a8ff
  accent: string; // e.g. #7000ff
  bgGradient: string; // CSS gradient
  glow: string;
  textColor: string;
  border: string;
}
