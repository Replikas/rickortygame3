import { debugLog } from "@/lib/utils";

// Audio manager class for handling all game sounds
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private masterVolume = 1;
  private sfxVolume = 1;
  private musicVolume = 1;
  private currentMusic: HTMLAudioElement | null = null;
  private soundCache = new Map<string, AudioBuffer>();

  private constructor() {
    this.initializeAudioContext();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      debugLog("Audio context initialization failed", error);
    }
  }

  setVolumes(master: number, sfx: number, music: number) {
    this.masterVolume = master / 100;
    this.sfxVolume = sfx / 100;
    this.musicVolume = music / 100;
    
    if (this.currentMusic) {
      this.currentMusic.volume = this.masterVolume * this.musicVolume;
    }
  }

  // Generate portal sounds using Web Audio API
  private generatePortalSound(type: "open" | "close" | "travel" | "error"): void {
    if (!this.audioContext) return;

    const volume = this.masterVolume * this.sfxVolume;
    if (volume === 0) return;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = volume * 0.3;

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);

    switch (type) {
      case "open":
        // Ascending portal whoosh
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        break;
      case "close":
        // Descending portal whoosh
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      case "travel":
        // Warbling travel sound
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        break;
      case "error":
        // Harsh error buzz
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.type = "sawtooth";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        break;
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 1);
  }

  // Generate character-specific sound effects
  private generateCharacterSound(character: string, emotion: string): void {
    if (!this.audioContext) return;

    const volume = this.masterVolume * this.sfxVolume;
    if (volume === 0) return;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = volume * 0.2;

    switch (character.toLowerCase()) {
      case "rick sanchez (c-137)":
      case "rick prime":
        this.generateRickSound(emotion, gainNode);
        break;
      case "morty smith":
        this.generateMortySound(emotion, gainNode);
        break;
      case "evil morty":
        this.generateEvilMortySound(emotion, gainNode);
        break;
    }
  }

  private generateRickSound(emotion: string, gainNode: GainNode): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);

    switch (emotion) {
      case "drunk":
        // Burp-like sound
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime + 0.2);
        oscillator.type = "sawtooth";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      case "angry":
        // Harsh angry grunt
        oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime);
        oscillator.type = "square";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        break;
      case "excited":
        // Mad scientist laugh
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(350, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      default:
        // Generic Rick grunt
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.type = "triangle";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  private generateMortySound(emotion: string, gainNode: GainNode): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);

    switch (emotion) {
      case "scared":
        // High-pitched whimper
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      case "nervous":
        // Stuttering sound
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(280, this.audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        break;
      case "excited":
        // Happy Morty sound
        oscillator.frequency.setValueAtTime(350, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(450, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
        break;
      default:
        // Generic Morty sound
        oscillator.frequency.setValueAtTime(320, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }

  private generateEvilMortySound(emotion: string, gainNode: GainNode): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);

    switch (emotion) {
      case "threatening":
        // Sinister low tone
        oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime);
        oscillator.type = "sawtooth";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        break;
      case "calculating":
        // Cold calculating beep
        oscillator.frequency.setValueAtTime(250, this.audioContext.currentTime);
        oscillator.type = "square";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        break;
      case "amused":
        // Dark chuckle
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      default:
        // Evil Morty default
        oscillator.frequency.setValueAtTime(280, this.audioContext.currentTime);
        oscillator.type = "triangle";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.6);
  }

  // Generate UI sounds
  private generateUISound(type: "click" | "select" | "notification" | "error"): void {
    if (!this.audioContext) return;

    const volume = this.masterVolume * this.sfxVolume;
    if (volume === 0) return;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = volume * 0.1;

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);

    switch (type) {
      case "click":
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        break;
      case "select":
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        break;
      case "notification":
        oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(700, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      case "error":
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
        oscillator.type = "sawtooth";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        break;
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  // Start ambient background music (now optional and subtle)
  startBackgroundMusic(): void {
    // Only play very subtle ambient sounds, not continuous music
    this.playAmbientTone();
  }

  private playAmbientTone(): void {
    if (!this.audioContext) return;

    const volume = this.masterVolume * this.musicVolume;
    if (volume === 0) return;

    // Play a very brief, subtle sci-fi tone
    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = volume * 0.01; // Much quieter

    const oscillator = this.audioContext.createOscillator();
    oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(120, this.audioContext.currentTime + 1);
    oscillator.type = "sine";
    oscillator.connect(gainNode);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);
  }

  stopBackgroundMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  // Public interface methods
  playPortalSound(type: "open" | "close" | "travel" | "error"): void {
    this.generatePortalSound(type);
    debugLog(`Playing portal sound: ${type}`);
  }

  playCharacterSound(character: string, emotion: string): void {
    this.generateCharacterSound(character, emotion);
    debugLog(`Playing character sound: ${character} - ${emotion}`);
  }

  playUISound(type: "click" | "select" | "notification" | "error"): void {
    this.generateUISound(type);
  }

  // Resume audio context if suspended (required for user interaction)
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        debugLog("Audio context resumed");
      } catch (error) {
        debugLog("Failed to resume audio context", error);
      }
    }
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();

// Utility functions for easy access
export function playPortalSound(soundType: "open" | "close" | "travel" | "error"): void {
  audioManager.playPortalSound(soundType);
}

export function playCharacterSound(character: string, emotion: string): void {
  audioManager.playCharacterSound(character, emotion);
}

export function playUISound(type: "click" | "select" | "notification" | "error"): void {
  audioManager.playUISound(type);
}

export function setAudioVolumes(master: number, sfx: number, music: number): void {
  audioManager.setVolumes(master, sfx, music);
}

export function startBackgroundMusic(): void {
  audioManager.startBackgroundMusic();
}

export function stopBackgroundMusic(): void {
  audioManager.stopBackgroundMusic();
}