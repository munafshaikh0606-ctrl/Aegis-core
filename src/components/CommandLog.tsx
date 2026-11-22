import React from 'react';
import { X, Bot, User, Volume2, Trash2, Sparkles } from 'lucide-react';
import { ChatMessage, ThemeColors } from '../types';

interface CommandLogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onClear: () => void;
  onReplaySpeech: (text: string) => void;
  theme: ThemeColors;
}

export const CommandLog: React.FC<CommandLogProps> = ({
  isOpen,
  onClose,
  messages,
  onClear,
  onReplaySpeech,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0D0E12]/95 border-l border-white/10 backdrop-blur-2xl shadow-2xl z-50 flex flex-col font-mono animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#16181D]">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-white" />
          <h2 className="font-syne text-sm font-extrabold text-white tracking-wider uppercase">EVENT LOG / TRANSCRIPT RELAY</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            className="p-1.5 bg-[#0D0E12] border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/50 transition-all text-xs flex items-center gap-1"
            title="Clear transcripts"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-[#0D0E12] border border-white/10 text-[#D1D5DB] hover:text-white hover:border-white/30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#D1D5DB]/40">
            <Sparkles className="w-8 h-8 mb-2 animate-pulse" style={{ color: theme.primary }} />
            <p className="text-xs tracking-widest uppercase">NO TRANSCRIPTS IN MEMORY BUFFER</p>
            <p className="text-[10px] text-[#D1D5DB]/30 mt-1 uppercase">Speak or transmit a command to initialize protocol.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3.5 border transition-all ${
                msg.sender === 'user'
                  ? 'bg-[#16181D] border-white/10 text-[#D1D5DB] ml-4'
                  : 'bg-[#16181D]/80 border-l-2 text-white mr-2 shadow-lg'
              }`}
              style={{
                borderLeftColor: msg.sender === 'jarvis' ? theme.primary : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  {msg.sender === 'user' ? (
                    <User className="w-3.5 h-3.5 text-[#D1D5DB]/60" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                  )}
                  <span className="font-bold uppercase tracking-widest text-white">
                    {msg.sender === 'user' ? 'OPERATOR' : 'AEGIS CORE'}
                  </span>
                  {msg.emotion && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-[#0D0E12] text-[#D1D5DB] border border-white/10 uppercase">
                      {msg.emotion}
                    </span>
                  )}
                </div>
                <span className="text-[#D1D5DB]/40 text-[10px]">
                  [{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                </span>
              </div>

              <p className="text-xs leading-relaxed whitespace-pre-wrap text-[#D1D5DB]">{msg.text}</p>

              {msg.sender === 'jarvis' && (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                  {msg.statusMessage && (
                    <span className="text-[10px] text-[#D1D5DB]/50 font-mono uppercase tracking-wider">
                      [{msg.statusMessage}]
                    </span>
                  )}
                  <button
                    onClick={() => onReplaySpeech(msg.text)}
                    className="ml-auto text-[10px] text-white hover:opacity-80 flex items-center gap-1 transition-all py-0.5 px-2 bg-[#0D0E12] border border-white/10 uppercase tracking-wider"
                  >
                    <Volume2 className="w-3 h-3" style={{ color: theme.primary }} /> REPLAY
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/10 bg-[#16181D] text-[10px] text-[#D1D5DB]/60 flex items-center justify-between uppercase tracking-widest">
        <span>LOG ENTRIES: {messages.length}</span>
        <span style={{ color: theme.primary }}>ENCRYPTION: ACTIVE</span>
      </div>
    </div>
  );
};
