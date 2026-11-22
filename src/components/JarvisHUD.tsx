import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Zap,
  Activity,
  Shield,
  Cpu,
  Layers,
  Sparkles,
  Settings,
  Terminal,
  RotateCcw,
  Sun,
  ShieldAlert,
} from 'lucide-react';
import { EmotionState, ThemeColors, SystemMetrics } from '../types';

interface JarvisHUDProps {
  emotion: EmotionState;
  theme: ThemeColors;
  isListening: boolean;
  isSpeaking: boolean;
  statusMessage: string;
  voiceOutputEnabled: boolean;
  onToggleVoiceOutput: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onSendCommand: (command: string) => void;
  onTriggerScan: () => void;
  onOpenSettings: () => void;
  onToggleCommandLog: () => void;
  isLogOpen: boolean;
}

export const JarvisHUD: React.FC<JarvisHUDProps> = ({
  emotion,
  theme,
  isListening,
  isSpeaking,
  statusMessage,
  voiceOutputEnabled,
  onToggleVoiceOutput,
  onStartListening,
  onStopListening,
  onSendCommand,
  onTriggerScan,
  onOpenSettings,
  onToggleCommandLog,
  isLogOpen,
}) => {
  const [inputText, setInputText] = useState('');
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 14,
    memoryUsage: 38,
    quantumCoherence: 99.8,
    audioFrequency: 0,
    fps: 60,
    latencyMs: 12,
    recognizedCommand: 'IDLE',
  });

  // Simulate dynamic realistic system metrics telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.floor(12 + Math.random() * 25 + (isSpeaking ? 15 : 0)),
        memoryUsage: Math.floor(36 + Math.random() * 4),
        quantumCoherence: Number((99.4 + Math.random() * 0.5).toFixed(2)),
        fps: Math.floor(58 + Math.random() * 3),
        latencyMs: Math.floor(10 + Math.random() * 8),
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendCommand(inputText.trim());
    setInputText('');
  };

  const isAlertMode = emotion === 'alert';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 select-none overflow-hidden font-mono z-10">
      {/* Emergency Red Alert Flashing Border */}
      {isAlertMode && (
        <div className="absolute inset-0 border-4 border-red-500/80 animate-pulse bg-red-950/20 pointer-events-none z-20" />
      )}

      {/* --- TOP HUD BAR --- */}
      <div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-auto bg-[#16181D] border-b-4 p-3 md:px-6 shadow-2xl transition-all"
        style={{ borderBottomColor: theme.primary }}
      >
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border border-white/20 animate-[spin_10s_linear_infinite]"
            style={{ borderColor: theme.primary, boxShadow: `0 0 15px ${theme.glow}` }}
          >
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-syne text-2xl md:text-3xl font-extrabold text-white tracking-tighter uppercase flex items-center gap-2">
              AEGIS_CORE
            </h1>
            <p className="text-[10px] uppercase tracking-[0.25em] font-mono" style={{ color: theme.primary }}>
              INTERFACE v4.0.2 / NEURAL RELAY ACTIVE
            </p>
          </div>
        </div>

        {/* Center: System Status Telemetry */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2 bg-[#0D0E12] px-3 py-1.5 border border-white/10 rounded-sm">
            <Cpu className="w-4 h-4 text-[#FF3E00]" style={{ color: theme.primary }} />
            <span className="text-[#D1D5DB]/70 uppercase text-[10px] tracking-wider">LOAD:</span>
            <span className="text-white font-syne font-extrabold text-base">{metrics.cpuUsage}%</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0D0E12] px-3 py-1.5 border border-white/10 rounded-sm">
            <Activity className="w-4 h-4 text-[#FF3E00]" style={{ color: theme.primary }} />
            <span className="text-[#D1D5DB]/70 uppercase text-[10px] tracking-wider">COHERENCE:</span>
            <span className="text-white font-syne font-extrabold text-base">{metrics.quantumCoherence}%</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0D0E12] px-3 py-1.5 border border-white/10 rounded-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-[#D1D5DB]/70 uppercase text-[10px] tracking-wider">LATENCY:</span>
            <span className="text-white font-syne font-extrabold text-base">{metrics.latencyMs}ms</span>
          </div>
        </div>

        {/* Right: Controls & Voice Mute Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto font-mono">
          <button
            onClick={onToggleVoiceOutput}
            className={`px-3 py-2 text-xs flex items-center gap-1.5 transition-all uppercase tracking-wider font-bold border ${
              voiceOutputEnabled
                ? 'bg-[#FF3E00] text-black border-[#FF3E00]'
                : 'bg-[#0D0E12] border-white/10 text-[#D1D5DB]/60 hover:text-white'
            }`}
            style={{
              backgroundColor: voiceOutputEnabled ? theme.primary : '#0D0E12',
              borderColor: voiceOutputEnabled ? theme.primary : 'rgba(255,255,255,0.1)',
              color: voiceOutputEnabled ? '#000' : '#D1D5DB',
            }}
            title={voiceOutputEnabled ? 'Voice Synthesis Active' : 'Voice Synthesis Muted'}
          >
            {voiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{voiceOutputEnabled ? 'SPEECH ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={onToggleCommandLog}
            className={`px-3 py-2 text-xs flex items-center gap-1.5 transition-all uppercase tracking-wider font-bold border ${
              isLogOpen
                ? 'bg-white text-black border-white'
                : 'bg-[#0D0E12] border-white/10 text-[#D1D5DB] hover:border-white/30'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span className="hidden md:inline">LOGS</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 bg-[#0D0E12] border border-white/10 text-[#D1D5DB] hover:text-white hover:border-white/30 transition-all"
            title="System Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* --- SIDE DIAGNOSTIC WIDGETS --- */}
      <div className="flex justify-between items-center my-auto pointer-events-none">
        {/* Left Side System Metrics Panel */}
        <div 
          className="hidden md:flex flex-col gap-3 p-4 bg-[#16181D] border-l-2 backdrop-blur-md pointer-events-auto shadow-xl text-xs max-w-[180px]"
          style={{ borderLeftColor: theme.primary }}
        >
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono" style={{ color: theme.primary }}>SYSTEM LOAD</span>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#D1D5DB]/70">NEURAL LOAD</span>
            <span className="font-syne text-3xl font-extrabold text-white block">{metrics.cpuUsage}%</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#D1D5DB]/70">COHERENCE</span>
            <span className="font-syne text-3xl font-extrabold text-white block">{metrics.quantumCoherence}%</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#D1D5DB]/70">LATENCY</span>
            <span className="font-syne text-2xl font-extrabold text-white block">{metrics.latencyMs}ms</span>
          </div>
        </div>

        {/* Right Side Environmental Data Panel */}
        <div 
          className="hidden md:flex flex-col gap-3 p-4 bg-[#16181D] border-l-2 backdrop-blur-md pointer-events-auto shadow-xl text-xs max-w-[180px]"
          style={{ borderLeftColor: theme.primary }}
        >
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="text-[10px] uppercase tracking-[0.25em] font-mono" style={{ color: theme.primary }}>ENVIRONMENT</span>
            <span className="text-white/60 font-mono text-[9px]">v4.0.2</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#D1D5DB]/70">OXYGEN / PRES</span>
            <span className="font-syne text-2xl font-extrabold text-white block">72% / 101</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-[#D1D5DB]/70">STATE</span>
            <span className="font-syne text-2xl font-extrabold text-white uppercase block">{emotion}</span>
          </div>

          <button
            onClick={onTriggerScan}
            className="mt-1 py-2 px-3 bg-[#0D0E12] border border-white/10 hover:border-white/40 text-white transition-all text-[10px] flex items-center justify-center gap-1.5 uppercase tracking-widest font-bold"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: theme.primary }} /> SCAN
          </button>
        </div>
      </div>

      {/* --- BOTTOM FLOATING COMMAND INPUT & MIC CONTROLLER --- */}
      <div className="pointer-events-auto flex flex-col gap-2 max-w-4xl mx-auto w-full font-mono">
        {/* Quick Commands Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-[11px]">
          <span className="text-[10px] uppercase tracking-widest shrink-0 hidden sm:inline" style={{ color: theme.primary }}>PRESETS:</span>
          <button
            onClick={() => onSendCommand('Run a full diagnostic scan on all system nodes')}
            className="px-3 py-1 bg-[#16181D] border border-white/10 text-[#D1D5DB] hover:border-white/40 transition-all shrink-0 uppercase tracking-wider text-[10px]"
          >
            Diagnostic Scan
          </button>
          <button
            onClick={() => onSendCommand('What is your core directive, AEGIS?')}
            className="px-3 py-1 bg-[#16181D] border border-white/10 text-[#D1D5DB] hover:border-white/40 transition-all shrink-0 uppercase tracking-wider text-[10px]"
          >
            Who Are You?
          </button>
          <button
            onClick={() => onSendCommand('Switch HUD color theme to Aegis Core Orange')}
            className="px-3 py-1 bg-[#16181D] border border-white/10 text-[#D1D5DB] hover:border-white/40 transition-all shrink-0 uppercase tracking-wider text-[10px]"
          >
            Core Theme
          </button>
          <button
            onClick={() => onSendCommand('Engage security protocol and test red alert mode!')}
            className="px-3 py-1 bg-[#16181D] border border-white/10 text-red-400 hover:border-red-500 transition-all shrink-0 uppercase tracking-wider text-[10px]"
          >
            Security Alert
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-stretch gap-0 bg-[#000] border border-white/15 p-1 shadow-2xl"
        >
          {/* Voice Command Mic Trigger Button */}
          <button
            type="button"
            onClick={isListening ? onStopListening : onStartListening}
            className={`relative px-4 flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-[#16181D] hover:bg-white/10 text-[#D1D5DB] border-r border-white/10'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak Voice Command'}
          >
            {isListening ? <Mic className="w-5 h-5 animate-bounce" /> : <MicOff className="w-5 h-5" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {/* Text Command Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'LISTENING TO VOCAL INTERCEPT...'
                : 'ENTER COMMAND / INTERCEPT PROTOCOL'
            }
            className="flex-1 bg-[#000] px-4 py-3 text-xs md:text-sm text-white placeholder-[#D1D5DB]/40 outline-none font-mono tracking-wider"
            style={{ color: theme.primary }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            style={{ backgroundColor: theme.primary }}
            className="px-6 md:px-10 py-3 bg-[#FF3E00] hover:opacity-90 disabled:opacity-30 text-black font-syne font-extrabold text-sm md:text-base uppercase tracking-wider flex items-center gap-2 transition-all shrink-0"
          >
            <Send className="w-4 h-4 text-black" />
            <span>TRANSMIT</span>
          </button>
        </form>
      </div>
    </div>
  );
};
