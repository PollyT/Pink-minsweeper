class SoundService {
  private ctx: AudioContext | null = null;
  private volume: number = 0.3;
  private enabled: boolean = true;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Initialize lazily on first interaction
    if (typeof window !== 'undefined' && window.speechSynthesis) {
       // Load voices (async in Chrome)
       window.speechSynthesis.onvoiceschanged = () => {
         this.voices = window.speechSynthesis.getVoices();
       };
    }
  }

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public setVolume(vol: number) {
    this.volume = vol;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);

    gain.gain.setValueAtTime(0, this.ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + startTime);
    osc.stop(this.ctx.currentTime + startTime + duration);
  }

  public playClick() {
    // Soft pluck
    this.playTone(400, 'sine', 0.15);
  }

  public playFlag() {
    // Higher pitched woodblock-ish
    this.playTone(800, 'triangle', 0.1);
  }

  public playPop() {
    // Bubble sound for reveal
    this.playTone(300 + Math.random() * 200, 'sine', 0.2);
  }

  public playUndo() {
    // Rewind effect simulation
    this.playTone(200, 'sawtooth', 0.3);
  }

  public playWin() {
    // Major chord arpeggio
    this.playTone(523.25, 'sine', 0.5, 0); // C5
    this.playTone(659.25, 'sine', 0.5, 0.1); // E5
    this.playTone(783.99, 'sine', 0.8, 0.2); // G5
    this.playTone(1046.50, 'sine', 1.0, 0.3); // C6
  }

  public playLose() {
    if (!this.enabled) return;

    // Soft thud for the explosion contact
    this.playTone(100, 'triangle', 0.3);

    // Gentle "Oops" voice
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance("Oops");
        // Slightly louder than tones to be clear
        utterance.volume = Math.min(this.volume + 0.4, 1); 
        utterance.rate = 1.1;
        utterance.pitch = 1.3; // Higher pitch approximates a more "gentle/feminine" tone by default

        // Try to load voices if they haven't populated yet
        if (this.voices.length === 0) {
             this.voices = window.speechSynthesis.getVoices();
        }

        // Try to pick a female-sounding voice
        // "Google US English" is often female. "Samantha" (macOS) is female. "Zira" (Windows) is female.
        const preferredVoice = this.voices.find(v => 
            v.name === "Google US English" || 
            v.name === "Samantha" || 
            v.name === "Microsoft Zira Desktop" ||
            (v.name.includes("Female") && v.lang.startsWith("en"))
        );

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        window.speechSynthesis.cancel(); // Stop any previous speech
        window.speechSynthesis.speak(utterance);
    }
  }

  public playUnlock() {
    // Magical sparkle
    for(let i=0; i<5; i++) {
        this.playTone(1000 + (i*200), 'sine', 0.3, i * 0.08);
    }
  }
}

export const soundService = new SoundService();