/**
 * Froosh Junction Audio Chime & Announcement Engine
 * Synthesizes an Indian Railway station 3-tone chime using Web Audio API.
 */

class AudioService {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Plays the iconic 3-tone Indian Railway chime (G4 -> C5 -> E5)
   */
  public playStationChime(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Frequencies: G4 (392Hz), C5 (523.25Hz), E5 (659.25Hz)
    const tones = [
      { freq: 392.0, time: 0.0, duration: 0.35 },
      { freq: 523.25, time: 0.38, duration: 0.35 },
      { freq: 659.25, time: 0.76, duration: 0.6 },
    ];

    tones.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Soft envelope for chime quality
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  }

  /**
   * Optional speech announcement: "Attention please, Ticket number [id] is ready at Platform Counter"
   */
  public speakAnnouncement(text: string): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    this.playStationChime();

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback silently if speech synthesis is disabled
      }
    }, 1200);
  }
}

export const audioService = new AudioService();
