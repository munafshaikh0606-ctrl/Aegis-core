// Voice Recognition and Web Speech Synthesis utilities for JARVIS

export class VoiceManager {
  private recognition: any = null;
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  private isListening: boolean = false;
  private isSpeaking: boolean = false;

  public onResultCallback: ((text: string) => void) | null = null;
  public onErrorCallback: ((error: string) => void) | null = null;
  public onStateChangeCallback: ((listening: boolean, speaking: boolean) => void) | null = null;
  public onAudioLevelCallback: ((level: number) => void) | null = null;

  private selectedVoice: SpeechSynthesisVoice | null = null;
  public speechRate: number = 1.0;
  public speechPitch: number = 0.95;

  constructor() {
    if (typeof window !== 'undefined') {
      // Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }

      // Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.notifyState();
        };

        this.recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (event.results[0].isFinal && this.onResultCallback) {
            this.onResultCallback(transcript.trim());
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          this.notifyState();
          if (this.onErrorCallback) {
            this.onErrorCallback(`Voice recognition: ${event.error}`);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.notifyState();
        };
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer British or American smooth deep voice for JARVIS
    const jarvisVoice = voices.find(
      (v) =>
        v.name.includes('Google UK English Male') ||
        v.name.includes('Microsoft George') ||
        v.name.includes('Daniel') ||
        (v.lang.startsWith('en') && v.name.toLowerCase().includes('male'))
    ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    if (jarvisVoice) {
      this.selectedVoice = jarvisVoice;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synth ? this.synth.getVoices().filter((v) => v.lang.startsWith('en')) : [];
  }

  public setVoice(voiceName: string) {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const found = voices.find((v) => v.name === voiceName);
    if (found) {
      this.selectedVoice = found;
    }
  }

  public startListening() {
    if (!this.recognition) {
      if (this.onErrorCallback) {
        this.onErrorCallback('Speech recognition is not supported in this browser.');
      }
      return;
    }
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.synth) return;

    // Cancel ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.speechRate;
    utterance.pitch = this.speechPitch;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifyState();
      this.simulateLipSync(text.length);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.notifyState();
      if (this.onAudioLevelCallback) this.onAudioLevelCallback(0);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      this.isSpeaking = false;
      this.notifyState();
      if (this.onAudioLevelCallback) this.onAudioLevelCallback(0);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.notifyState();
      if (this.onAudioLevelCallback) this.onAudioLevelCallback(0);
    }
  }

  private simulateLipSync(textLength: number) {
    let elapsed = 0;
    const durationMs = Math.max(1500, textLength * 65);
    const interval = setInterval(() => {
      if (!this.isSpeaking || elapsed >= durationMs) {
        clearInterval(interval);
        if (this.onAudioLevelCallback) this.onAudioLevelCallback(0);
        return;
      }
      elapsed += 50;
      // Generate realistic natural speech envelope
      const level = (Math.sin(elapsed * 0.02) * 0.4 + 0.5) * (Math.random() * 0.6 + 0.4);
      if (this.onAudioLevelCallback) {
        this.onAudioLevelCallback(level);
      }
    }, 50);
  }

  private notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.isListening, this.isSpeaking);
    }
  }

  public playBeepSound(type: 'command' | 'alert' | 'scan') {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'command') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'scan') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(2400, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // AudioContext disabled or blocked by policy until user interaction
    }
  }
}
