export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private masterVolume = 1;
  private sfxVolume = 1;
  private musicVolume = 1;
  private currentMusic: HTMLAudioElement | null = null;

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
      console.log('Audio context not supported');
    }
  }

  setVolumes(master: number, sfx: number, music: number) {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.musicVolume = Math.max(0, Math.min(1, music));
    
    if (this.currentMusic) {
      this.currentMusic.volume = this.masterVolume * this.musicVolume * 0.3;
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

  private async playCharacterAudio(character: string, emotion: string): Promise<void> {
    console.log(`[Rick & Morty Simulator] Playing character sound: ${character} - ${emotion}`);
    
    // Try to play actual sound file first
    const soundUrl = this.getCharacterSoundUrl(character, emotion);
    if (soundUrl) {
      this.playAudioFile(soundUrl, this.sfxVolume);
      return;
    }
    
    // Fallback to generated sound
    this.generateCharacterSound(character, emotion);
  }

  private getCharacterSoundUrl(character: string, emotion: string): string | null {
    const characterName = character.toLowerCase();
    const soundMap: { [key: string]: { [key: string]: string } } = {
      'rick sanchez (c-137)': {
        'drunk': '/sounds/rick-burp.mp3',
        'angry': '/sounds/rick-angry.mp3',
        'sarcastic': '/sounds/rick-sarcastic.mp3',
        'dismissive': '/sounds/rick-sarcastic.mp3',
        'annoyed': '/sounds/rick-sarcastic.mp3',
        'default': '/sounds/rick-burp.mp3'
      },
      'rick prime': {
        'calculating': '/sounds/rick-prime-calculating.mp3',
        'angry': '/sounds/rick-prime-angry.mp3',
        'happy': '/sounds/rick-prime-laugh.wav',
        'satisfied': '/sounds/rick-prime-laugh.wav',
        'amused': '/sounds/rick-prime-laugh.wav',
        'default': '/sounds/rick-prime-laugh.wav'
      },
      'morty smith': {
        'nervous': '/sounds/morty-ohgeez.mp3',
        'excited': '/sounds/morty-excited.mp3',
        'scared': '/sounds/morty-scared.mp3',
        'default': '/sounds/morty-ohgeez.mp3'
      },
      'evil morty': {
        'calculating': '/sounds/evil-morty-calculating.wav',
        'satisfied': '/sounds/evil-morty-satisfied.mp3',
        'default': '/sounds/evil-morty-calculating.wav'
      }
    };

    const characterSounds = soundMap[characterName];
    if (!characterSounds) return null;
    
    return characterSounds[emotion] || characterSounds['default'] || null;
  }

  private playAudioFile(url: string, volume: number): void {
    const audio = new Audio(url);
    audio.volume = this.masterVolume * volume * 0.5;
    
    audio.play().catch(error => {
      console.log(`[Rick & Morty Simulator] Failed to play audio: ${url}`, error);
    });
  }

  private generateCharacterSound(character: string, emotion: string): void {
    if (!this.audioContext) return;

    const volume = this.masterVolume * this.sfxVolume;
    if (volume === 0) return;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = volume * 0.2;

    const characterName = character.toLowerCase();
    
    if (characterName.includes('rick prime')) {
      this.generateRickPrimeSound(emotion, gainNode);
    } else if (characterName.includes('rick')) {
      this.generateRickSound(emotion, gainNode);
    } else if (characterName.includes('evil morty')) {
      this.generateEvilMortySound(emotion, gainNode);
    } else if (characterName.includes('morty')) {
      this.generateMortySound(emotion, gainNode);
    }
  }

  private generateRickSound(emotion: string, gainNode: GainNode): void {
    if (!this.audioContext) return;

    // Rick's burp-like sound
    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);
    oscillator.type = "sawtooth";

    switch (emotion) {
      case "drunk":
        // Lower, more slurred burp
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(120, this.audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        break;
      case "angry":
        // Harsh, aggressive burp
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      default:
        // Regular Rick burp
        oscillator.frequency.setValueAtTime(90, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.6);
  }

  private generateRickPrimeSound(emotion: string, gainNode: GainNode): void {
    if (!this.audioContext) return;

    // Rick Prime's more calculated, deeper sound
    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);
    oscillator.type = "triangle";

    switch (emotion) {
      case "calculating":
        // Deep, methodical hum
        oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.4);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        break;
      case "angry":
        // Sharp, controlled burst
        oscillator.frequency.setValueAtTime(70, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(140, this.audioContext.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        break;
      default:
        // Standard Rick Prime sound
        oscillator.frequency.setValueAtTime(65, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  private generateMortySound(emotion: string, gainNode: GainNode): void {
    if (!this.audioContext) return;

    // Morty's nervous, higher-pitched sounds
    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);
    oscillator.type = "sine";

    switch (emotion) {
      case "nervous":
        // Shaky, uncertain sound
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(180, this.audioContext.currentTime + 0.05);
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(190, this.audioContext.currentTime + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      case "excited":
        // Quick, high burst
        oscillator.frequency.setValueAtTime(250, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
        break;
      default:
        // Regular Morty sound
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(180, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }

  private generateEvilMortySound(emotion: string, gainNode: GainNode): void {
    if (!this.audioContext) return;

    // Evil Morty's cold, calculated sounds
    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);
    oscillator.type = "square";

    switch (emotion) {
      case "calculating":
        // Cold, steady tone
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(160, this.audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
        break;
      case "satisfied":
        // Subtle, pleased hum
        oscillator.frequency.setValueAtTime(160, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(180, this.audioContext.currentTime + 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        break;
      default:
        // Standard Evil Morty sound
        oscillator.frequency.setValueAtTime(155, this.audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(165, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    }

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }

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
        oscillator.type = "sine";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        break;
      case "select":
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.type = "sine";
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        break;
      case "notification":
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);
        oscillator.type = "sine";
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

  startBackgroundMusic(): void {
    if (this.currentMusic) return;

    // Create ambient interdimensional atmosphere
    this.playAmbientTone();
  }

  private playAmbientTone(): void {
    if (!this.audioContext) return;

    const volume = this.masterVolume * this.musicVolume;
    if (volume === 0) return;

    const gainNode = this.audioContext.createGain();
    gainNode.connect(this.audioContext.destination);
    gainNode.gain.value = volume * 0.05;

    const oscillator = this.audioContext.createOscillator();
    oscillator.connect(gainNode);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime);

    // Subtle frequency modulation for that sci-fi feel
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    lfoGain.gain.setValueAtTime(5, this.audioContext.currentTime);

    oscillator.start();
    lfo.start();

    // Schedule restart for continuous ambient
    setTimeout(() => {
      oscillator.stop();
      lfo.stop();
      if (this.currentMusic !== null) {
        this.playAmbientTone();
      }
    }, 10000);
  }

  stopBackgroundMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  playPortalSound(type: "open" | "close" | "travel" | "error"): void {
    this.generatePortalSound(type);
  }

  playCharacterSound(character: string, emotion: string): void {
    this.playCharacterAudio(character, emotion);
  }

  playUISound(type: "click" | "select" | "notification" | "error"): void {
    this.generateUISound(type);
  }

  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }
}

export const audioManager = AudioManager.getInstance();

// Convenience functions
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