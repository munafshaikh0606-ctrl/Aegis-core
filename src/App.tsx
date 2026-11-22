import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RobotCanvas } from './components/RobotCanvas';
import { JarvisHUD } from './components/JarvisHUD';
import { CommandLog } from './components/CommandLog';
import { SettingsModal } from './components/SettingsModal';
import { VoiceManager } from './utils/voiceUtils';
import {
  EmotionState,
  ThemeMode,
  ThemeColors,
  ChatMessage,
  RobotFaceSettings,
  SystemAction,
} from './types';

// Preset Theme Configurations matching Aegis Core 3D Terminal aesthetic
const THEMES: Record<ThemeMode, ThemeColors> = {
  cyan: {
    name: 'Aegis Core Orange',
    primary: '#FF3E00',
    secondary: '#16181D',
    accent: '#FF5722',
    bgGradient: 'from-[#0D0E12] via-[#16181D] to-[#0D0E12]',
    glow: 'rgba(255, 62, 0, 0.4)',
    textColor: 'text-[#FF3E00]',
    border: 'border-[#FF3E00]/40',
  },
  crimson: {
    name: 'Crimson Terminal',
    primary: '#ff2a4b',
    secondary: '#16181D',
    accent: '#f87171',
    bgGradient: 'from-[#0D0E12] via-[#1a080c] to-[#0D0E12]',
    glow: 'rgba(255, 42, 75, 0.4)',
    textColor: 'text-red-400',
    border: 'border-red-900/50',
  },
  emerald: {
    name: 'Emerald Terminal',
    primary: '#10b981',
    secondary: '#16181D',
    accent: '#34d399',
    bgGradient: 'from-[#0D0E12] via-[#061812] to-[#0D0E12]',
    glow: 'rgba(16, 185, 129, 0.4)',
    textColor: 'text-emerald-400',
    border: 'border-emerald-900/50',
  },
  amber: {
    name: 'Solar Terminal',
    primary: '#f59e0b',
    secondary: '#16181D',
    accent: '#fbbf24',
    bgGradient: 'from-[#0D0E12] via-[#181206] to-[#0D0E12]',
    glow: 'rgba(245, 158, 11, 0.4)',
    textColor: 'text-amber-400',
    border: 'border-amber-900/50',
  },
  violet: {
    name: 'Quantum Terminal',
    primary: '#a855f7',
    secondary: '#16181D',
    accent: '#c084fc',
    bgGradient: 'from-[#0D0E12] via-[#12081c] to-[#0D0E12]',
    glow: 'rgba(168, 85, 247, 0.4)',
    textColor: 'text-purple-400',
    border: 'border-purple-900/50',
  },
};

export default function App() {
  // Core State
  const [emotion, setEmotion] = useState<EmotionState>('happy');
  const [themeKey, setThemeKey] = useState<ThemeMode>('cyan');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('SYSTEMS ONLINE');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // UI Drawer states
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Settings
  const [settings, setSettings] = useState<RobotFaceSettings>({
    wireframe: false,
    autoRotate: true,
    particleDensity: 200,
    glowIntensity: 1.0,
    voiceSensitivity: 1.0,
    speechRate: 1.0,
    speechPitch: 0.95,
    voiceName: '',
    enableVoiceOutput: true,
    soundEffects: true,
    trackingMouse: true,
  });

  // Voice State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const voiceManagerRef = useRef<VoiceManager | null>(null);

  // Send command to backend Express Gemini endpoint
  const handleSendCommand = useCallback(
    async (commandText: string) => {
      // 1. Add User Message
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: commandText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setEmotion('thinking');
      setStatusMessage('PROCESSING COMMAND...');

      if (settings.soundEffects && voiceManagerRef.current) {
        voiceManagerRef.current.playBeepSound('command');
      }

      try {
        // 2. Call backend /api/chat
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: commandText }),
        });

        const data = await response.json();

        const replyText = data.text || 'Systems operational, Sir.';
        const newEmotion: EmotionState = (data.emotion as EmotionState) || 'speaking';
        const action: SystemAction = (data.action as SystemAction) || 'none';
        const newStatus = data.statusMessage || 'COMMAND COMPLETE';

        // 3. Add JARVIS Response
        const jarvisMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'jarvis',
          text: replyText,
          timestamp: new Date(),
          emotion: newEmotion,
          statusMessage: newStatus,
          action,
        };

        setMessages((prev) => [...prev, jarvisMsg]);
        setEmotion(newEmotion);
        setStatusMessage(newStatus);

        // 4. Handle System Action Commands
        if (action === 'scan') {
          if (settings.soundEffects && voiceManagerRef.current) {
            voiceManagerRef.current.playBeepSound('scan');
          }
        } else if (action === 'theme_cyan') setThemeKey('cyan');
        else if (action === 'theme_crimson') setThemeKey('crimson');
        else if (action === 'theme_emerald') setThemeKey('emerald');
        else if (action === 'theme_amber') setThemeKey('amber');
        else if (action === 'theme_violet') setThemeKey('violet');
        else if (action === 'security_alert' && settings.soundEffects && voiceManagerRef.current) {
          voiceManagerRef.current.playBeepSound('alert');
        }

        // 5. Speech Output
        if (settings.enableVoiceOutput && voiceManagerRef.current) {
          voiceManagerRef.current.speak(replyText, () => {
            setEmotion('neutral');
            setStatusMessage('ALL SYSTEMS OPTIMAL');
          });
        } else {
          // Reset emotion after time if speech output disabled
          setTimeout(() => {
            setEmotion('neutral');
            setStatusMessage('ALL SYSTEMS OPTIMAL');
          }, 3500);
        }
      } catch (err) {
        console.error('Error communicating with JARVIS server:', err);
        const errorMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'jarvis',
          text: 'My apologies, Sir. An anomaly interrupted the neural transmission.',
          timestamp: new Date(),
          emotion: 'glitch',
          statusMessage: 'COMMUNICATION ERROR',
        };
        setMessages((prev) => [...prev, errorMsg]);
        setEmotion('glitch');
        setStatusMessage('ANOMALY DETECTED');
      }
    },
    [settings.enableVoiceOutput, settings.soundEffects]
  );

  // Initialize Voice Manager
  useEffect(() => {
    const vm = new VoiceManager();
    voiceManagerRef.current = vm;

    vm.onResultCallback = (transcript: string) => {
      if (transcript) {
        handleSendCommand(transcript);
      }
    };

    vm.onStateChangeCallback = (listening: boolean, speaking: boolean) => {
      setIsListening(listening);
      setIsSpeaking(speaking);
      if (listening) {
        setEmotion('listening');
        setStatusMessage('LISTENING TO VOICE...');
      }
    };

    vm.onAudioLevelCallback = (level: number) => {
      setAudioLevel(level);
    };

    // Load voices
    setTimeout(() => {
      const voices = vm.getAvailableVoices();
      setAvailableVoices(voices);
    }, 500);

    // Welcome Greeting
    const welcomeText =
      'Good day, Sir. J.A.R.V.I.S. online. 3D holographic neural matrix active and standing by for your instructions.';
    const initialMessage: ChatMessage = {
      id: 'init-1',
      sender: 'jarvis',
      text: welcomeText,
      timestamp: new Date(),
      emotion: 'happy',
      statusMessage: 'SYSTEM INITIALIZED',
    };

    setMessages([initialMessage]);

    // Initial Welcome Speech (delayed slightly so audio context is ready)
    const timer = setTimeout(() => {
      if (settings.enableVoiceOutput) {
        vm.speak(welcomeText, () => {
          setEmotion('neutral');
          setStatusMessage('STANDING BY');
        });
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      vm.stopSpeaking();
      vm.stopListening();
    };
  }, []);

  // Sync settings changes to VoiceManager
  useEffect(() => {
    if (voiceManagerRef.current) {
      voiceManagerRef.current.speechRate = settings.speechRate;
      voiceManagerRef.current.speechPitch = settings.speechPitch;
      if (settings.voiceName) {
        voiceManagerRef.current.setVoice(settings.voiceName);
      }
    }
  }, [settings.speechRate, settings.speechPitch, settings.voiceName]);

  const handleStartListening = () => {
    if (voiceManagerRef.current) {
      voiceManagerRef.current.startListening();
    }
  };

  const handleStopListening = () => {
    if (voiceManagerRef.current) {
      voiceManagerRef.current.stopListening();
    }
  };

  const handleToggleVoiceOutput = () => {
    setSettings((prev) => {
      const next = !prev.enableVoiceOutput;
      if (!next && voiceManagerRef.current) {
        voiceManagerRef.current.stopSpeaking();
      }
      return { ...prev, enableVoiceOutput: next };
    });
  };

  const handleReplaySpeech = (text: string) => {
    if (voiceManagerRef.current) {
      setEmotion('speaking');
      voiceManagerRef.current.speak(text, () => {
        setEmotion('neutral');
      });
    }
  };

  const handleTriggerScan = () => {
    handleSendCommand('Initiate system diagnostic scan and check core parameters');
  };

  const currentTheme = THEMES[themeKey];

  return (
    <main
      className={`relative w-screen h-screen overflow-hidden bg-[#0D0E12] bg-gradient-to-br ${currentTheme.bgGradient} text-[#D1D5DB] flex flex-col font-mono select-none border border-white/10 transition-all duration-700`}
    >
      {/* Background Radial Grid Overlay matching Aegis Core design */}
      <div className="absolute inset-0 bg-aegis-grid pointer-events-none z-0 opacity-80" />

      {/* 3D Robot Head Viewport */}
      <div className="relative flex-1 w-full h-full p-2 md:p-4 flex items-center justify-center z-10">
        <RobotCanvas
          emotion={emotion}
          theme={currentTheme}
          audioLevel={audioLevel}
          wireframe={settings.wireframe}
          mouseTracking={settings.trackingMouse}
        />

        {/* Sci-Fi HUD Control Overlay */}
        <JarvisHUD
          emotion={emotion}
          theme={currentTheme}
          isListening={isListening}
          isSpeaking={isSpeaking}
          statusMessage={statusMessage}
          voiceOutputEnabled={settings.enableVoiceOutput}
          onToggleVoiceOutput={handleToggleVoiceOutput}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          onSendCommand={handleSendCommand}
          onTriggerScan={handleTriggerScan}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleCommandLog={() => setIsLogOpen(!isLogOpen)}
          isLogOpen={isLogOpen}
        />
      </div>

      {/* Command Transcript History Sidebar Drawer */}
      <CommandLog
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        messages={messages}
        onClear={() => setMessages([])}
        onReplaySpeech={handleReplaySpeech}
        theme={currentTheme}
      />

      {/* Preferences & Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newPartial) => setSettings((prev) => ({ ...prev, ...newPartial }))}
        currentThemeKey={themeKey}
        onSelectTheme={(tKey) => setThemeKey(tKey)}
        themes={THEMES}
        availableVoices={availableVoices}
      />
    </main>
  );
}
