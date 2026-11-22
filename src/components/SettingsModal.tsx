import React from 'react';
import { X, Sliders, Volume2, Eye, Palette, Activity } from 'lucide-react';
import { RobotFaceSettings, ThemeMode, ThemeColors } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RobotFaceSettings;
  onUpdateSettings: (newSettings: Partial<RobotFaceSettings>) => void;
  currentThemeKey: ThemeMode;
  onSelectTheme: (themeKey: ThemeMode) => void;
  themes: Record<ThemeMode, ThemeColors>;
  availableVoices: SpeechSynthesisVoice[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentThemeKey,
  onSelectTheme,
  themes,
  availableVoices,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0D0E12]/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 font-mono">
      <div className="bg-[#16181D] border border-white/10 w-full max-w-lg p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-white" />
            <h2 className="font-syne text-sm font-extrabold text-white tracking-wider uppercase">SYSTEM PREFERENCES & RELAY</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#0D0E12] border border-white/10 text-[#D1D5DB] hover:text-white hover:border-white/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Theme Selection */}
        <div className="space-y-2.5">
          <label className="text-[10px] text-[#D1D5DB]/70 font-bold flex items-center gap-1.5 uppercase tracking-widest">
            <Palette className="w-3.5 h-3.5" style={{ color: themes[currentThemeKey].primary }} /> Color Spectrum Scheme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(themes) as ThemeMode[]).map((key) => {
              const theme = themes[key];
              const isSelected = currentThemeKey === key;
              return (
                <button
                  key={key}
                  onClick={() => onSelectTheme(key)}
                  className={`p-2 border text-left text-[11px] transition-all flex items-center gap-2 uppercase tracking-wider ${
                    isSelected
                      ? 'bg-[#0D0E12] border-2 text-white font-extrabold'
                      : 'bg-[#0D0E12] border-white/10 text-[#D1D5DB]/70 hover:border-white/30'
                  }`}
                  style={{
                    borderColor: isSelected ? theme.primary : undefined,
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-white/20"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="truncate">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 3D Model Controls */}
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <label className="text-[10px] text-[#D1D5DB]/70 font-bold flex items-center gap-1.5 uppercase tracking-widest">
            <Eye className="w-3.5 h-3.5 text-white" /> Neural Matrix Renderer
          </label>

          <div className="space-y-2.5 bg-[#0D0E12] p-3 border border-white/10">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#D1D5DB] uppercase tracking-wider">Holographic Wireframe Grid</span>
              <input
                type="checkbox"
                checked={settings.wireframe}
                onChange={(e) => onUpdateSettings({ wireframe: e.target.checked })}
                className="w-4 h-4 accent-[#FF3E00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#D1D5DB] uppercase tracking-wider">Interactive Head Mouse Tracking</span>
              <input
                type="checkbox"
                checked={settings.trackingMouse}
                onChange={(e) => onUpdateSettings({ trackingMouse: e.target.checked })}
                className="w-4 h-4 accent-[#FF3E00] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#D1D5DB] uppercase tracking-wider">Acoustic Feedback Beeps</span>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) => onUpdateSettings({ soundEffects: e.target.checked })}
                className="w-4 h-4 accent-[#FF3E00] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 3. Voice & Speech Synthesis Controls */}
        <div className="space-y-2.5 pt-2 border-t border-white/10">
          <label className="text-[10px] text-[#D1D5DB]/70 font-bold flex items-center gap-1.5 uppercase tracking-widest">
            <Volume2 className="w-3.5 h-3.5 text-white" /> Vocal Protocol Synthesis
          </label>

          <div className="space-y-3 bg-[#0D0E12] p-3 border border-white/10">
            {availableVoices.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] text-[#D1D5DB]/60 uppercase tracking-wider">Preferred Neural Voice</span>
                <select
                  value={settings.voiceName}
                  onChange={(e) => onUpdateSettings({ voiceName: e.target.value })}
                  className="w-full bg-[#16181D] border border-white/20 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#FF3E00] uppercase font-mono"
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#D1D5DB] uppercase tracking-wider">
                <span>Vocal Speech Rate</span>
                <span className="text-white">{settings.speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.5"
                step="0.05"
                value={settings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-[#FF3E00] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#D1D5DB] uppercase tracking-wider">
                <span>Frequency Pitch</span>
                <span className="text-white">{settings.speechPitch.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={settings.speechPitch}
                onChange={(e) => onUpdateSettings({ speechPitch: parseFloat(e.target.value) })}
                className="w-full accent-[#FF3E00] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            style={{ backgroundColor: themes[currentThemeKey].primary }}
            className="w-full py-3 bg-[#FF3E00] hover:opacity-90 text-black font-syne font-extrabold text-xs md:text-sm uppercase tracking-wider transition-all"
          >
            Apply & Commit Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
