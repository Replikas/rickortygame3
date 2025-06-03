// Free voice generation using Web Speech API and online services
export interface VoiceGenerationOptions {
  text: string;
  character: string;
  emotion?: string;
}

export interface VoiceProvider {
  name: string;
  generateSpeech(options: VoiceGenerationOptions): Promise<string | null>;
}

// Completely free voice generation providers
class FreeVoiceProviders {

  // Web Speech API with character-specific voice tweaks
  async tryWebSpeechAPI(options: VoiceGenerationOptions): Promise<string | null> {
    if (!('speechSynthesis' in window)) return null;

    return new Promise((resolve) => {
      try {
        const utterance = new SpeechSynthesisUtterance(options.text);
        
        // Configure voice based on character
        const voiceConfig = this.getWebSpeechConfig(options.character, options.emotion);
        utterance.rate = voiceConfig.rate;
        utterance.pitch = voiceConfig.pitch;
        utterance.volume = voiceConfig.volume;
        
        // Try to find the best available voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.toLowerCase().includes(voiceConfig.voiceName) ||
          voice.lang.includes(voiceConfig.lang)
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Create audio blob from speech synthesis
        const mediaRecorder = this.setupAudioRecording();
        if (!mediaRecorder) {
          // Fallback: just play the speech
          speechSynthesis.speak(utterance);
          resolve('web-speech-played');
          return;
        }

        utterance.onend = () => {
          mediaRecorder.stop();
        };

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            const audioBlob = new Blob([event.data], { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob);
            resolve(audioUrl);
          } else {
            resolve('web-speech-played');
          }
        };

        mediaRecorder.start();
        speechSynthesis.speak(utterance);

      } catch (error) {
        console.log('Web Speech API failed:', error);
        resolve(null);
      }
    });
  }

  // iMyFone Filme Character Voice Generator (has Rick and Morty voices)
  async tryiMyFoneFilme(options: VoiceGenerationOptions): Promise<string | null> {
    try {
      const voiceId = this.getiMyFoneVoiceId(options.character);
      const phrase = this.getEmotionalPhrase(options.character, options.emotion);
      
      // iMyFone API endpoint (may require different approach)
      const response = await fetch('https://filme.imyfone.com/api/voice-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: phrase,
          voice: voiceId,
          speed: this.getSpeedForEmotion(options.emotion),
          pitch: this.getPitchForCharacter(options.character)
        })
      });

      if (!response.ok) return null;
      
      const data = await response.json();
      return data.audio_url || null;
    } catch (error) {
      console.log('iMyFone Filme failed:', error);
      return null;
    }
  }

  // TTS Reader API (free online service)
  async tryTTSReader(options: VoiceGenerationOptions): Promise<string | null> {
    try {
      const voiceId = this.getTTSReaderVoice(options.character);
      const phrase = this.getEmotionalPhrase(options.character, options.emotion);
      
      const response = await fetch(`https://ttsreader.com/api/tts?text=${encodeURIComponent(phrase)}&voice=${voiceId}&speed=1`, {
        method: 'GET',
        mode: 'cors'
      });

      if (!response.ok) return null;
      
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.log('TTS Reader failed:', error);
      return null;
    }
  }

  // Responsive Voice API (has free tier)
  async tryResponsiveVoice(options: VoiceGenerationOptions): Promise<string | null> {
    try {
      if (!(window as any).responsiveVoice) {
        // Load Responsive Voice dynamically
        await this.loadResponsiveVoice();
      }

      const voiceConfig = this.getResponsiveVoiceConfig(options.character, options.emotion);
      const phrase = this.getEmotionalPhrase(options.character, options.emotion);

      return new Promise((resolve) => {
        const rv = (window as any).responsiveVoice;
        
        rv.speak(phrase, voiceConfig.voice, {
          rate: voiceConfig.rate,
          pitch: voiceConfig.pitch,
          volume: voiceConfig.volume,
          onend: () => resolve('responsive-voice-played'),
          onerror: () => resolve(null)
        });
      });

    } catch (error) {
      console.log('Responsive Voice failed:', error);
      return null;
    }
  }

  private setupAudioRecording(): MediaRecorder | null {
    try {
      // This is complex and may not work in all browsers
      // For now, return null to use fallback
      return null;
    } catch (error) {
      return null;
    }
  }

  private async loadResponsiveVoice(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).responsiveVoice) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://code.responsivevoice.org/responsivevoice.js?key=FREE';
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  private getWebSpeechConfig(character: string, emotion?: string) {
    const configs: { [key: string]: any } = {
      'rick sanchez (c-137)': {
        rate: 0.8,
        pitch: 0.3,
        volume: 0.9,
        voiceName: 'male',
        lang: 'en-US'
      },
      'rick prime': {
        rate: 0.7,
        pitch: 0.2,
        volume: 1.0,
        voiceName: 'male',
        lang: 'en-US'
      },
      'morty smith': {
        rate: 1.1,
        pitch: 1.2,
        volume: 0.8,
        voiceName: 'male',
        lang: 'en-US'
      },
      'evil morty': {
        rate: 0.9,
        pitch: 0.8,
        volume: 0.9,
        voiceName: 'male',
        lang: 'en-US'
      }
    };

    const config = configs[character.toLowerCase()] || configs['rick sanchez (c-137)'];
    
    // Adjust for emotion
    if (emotion === 'angry') {
      config.rate *= 1.2;
      config.pitch *= 0.8;
    } else if (emotion === 'excited') {
      config.rate *= 1.3;
      config.pitch *= 1.2;
    } else if (emotion === 'drunk') {
      config.rate *= 0.7;
      config.pitch *= 0.9;
    }

    return config;
  }

  private getiMyFoneVoiceId(character: string): string {
    const voiceMap: { [key: string]: string } = {
      'rick sanchez (c-137)': 'rick-sanchez',
      'rick prime': 'rick-prime', 
      'morty smith': 'morty-smith',
      'evil morty': 'evil-morty',
    };
    
    return voiceMap[character.toLowerCase()] || 'rick-sanchez';
  }

  private getSpeedForEmotion(emotion?: string): number {
    switch (emotion) {
      case 'excited': return 1.2;
      case 'angry': return 1.1;
      case 'drunk': return 0.8;
      case 'nervous': return 0.9;
      case 'calculating': return 0.85;
      default: return 1.0;
    }
  }

  private getPitchForCharacter(character: string): number {
    const characterName = character.toLowerCase();
    if (characterName.includes('rick prime')) return 0.7;
    if (characterName.includes('rick')) return 0.8;
    if (characterName.includes('evil morty')) return 0.9;
    if (characterName.includes('morty')) return 1.2;
    return 1.0;
  }

  private getTTSReaderVoice(character: string): string {
    const voiceMap: { [key: string]: string } = {
      'rick sanchez (c-137)': 'en-us-male-1',
      'rick prime': 'en-us-male-2',
      'morty smith': 'en-us-male-3',
      'evil morty': 'en-us-male-4',
    };
    
    return voiceMap[character.toLowerCase()] || 'en-us-male-1';
  }

  private getResponsiveVoiceConfig(character: string, emotion?: string) {
    const configs: { [key: string]: any } = {
      'rick sanchez (c-137)': {
        voice: 'UK English Male',
        rate: 0.8,
        pitch: 0.3,
        volume: 1
      },
      'rick prime': {
        voice: 'US English Male',
        rate: 0.7,
        pitch: 0.2,
        volume: 1
      },
      'morty smith': {
        voice: 'US English Male',
        rate: 1.2,
        pitch: 1.5,
        volume: 0.9
      },
      'evil morty': {
        voice: 'UK English Male',
        rate: 0.9,
        pitch: 0.8,
        volume: 1
      }
    };

    return configs[character.toLowerCase()] || configs['rick sanchez (c-137)'];
  }

  private getEmotionalPhrase(character: string, emotion?: string): string {
    const phrases: { [key: string]: { [key: string]: string[] } } = {
      'rick sanchez (c-137)': {
        'drunk': ['*burp*', 'Ugh, whatever', '*hic*'],
        'angry': ['What the hell?!', 'Are you kidding me?!', 'Seriously?!'],
        'excited': ['Woo! Science!', 'Yes! Portal gun!', 'Interdimensional!'],
        'dismissive': ['Whatever, sure', 'Uh-huh, right', 'Yeah, okay'],
        'sarcastic': ['Oh really?', 'How original', 'Brilliant']
      },
      'rick prime': {
        'superior': ['Pathetic', 'Obviously inferior', 'Weak'],
        'threatening': ['Don\'t test me', 'Wrong choice', 'You\'ll regret that'],
        'dismissive': ['Boring', 'Irrelevant', 'Meaningless'],
        'angry': ['Enough!', 'Silence!', 'Foolish!'],
        'amused': ['Amusing', 'How quaint', 'Predictable']
      },
      'morty smith': {
        'scared': ['Oh geez!', 'Aw man!', 'Oh no, oh no!'],
        'nervous': ['Um, well...', 'I don\'t know...', 'Maybe?'],
        'excited': ['Wow! Really?!', 'That\'s amazing!', 'Cool!'],
        'confused': ['What? Huh?', 'I don\'t get it', 'Wait, what?'],
        'determined': ['I can do this!', 'I\'ll try!', 'Let\'s go!']
      },
      'evil morty': {
        'calculating': ['Interesting', 'As expected', 'Predictable'],
        'threatening': ['Finally', 'Perfect timing', 'Exactly as planned'],
        'smug': ['Obviously', 'How typical', 'Naturally'],
        'angry': ['Enough games', 'This ends now', 'Disappointing'],
        'satisfied': ['Perfect', 'Excellent', 'Flawless']
      }
    };

    const characterPhrases = phrases[character.toLowerCase()];
    if (!characterPhrases || !emotion) return '*sound*';
    
    const emotionPhrases = characterPhrases[emotion] || ['*sound*'];
    return emotionPhrases[Math.floor(Math.random() * emotionPhrases.length)];
  }
}

export class VoiceGenerationService {
  private providers: FreeVoiceProviders;
  private cache = new Map<string, string>();

  constructor() {
    this.providers = new FreeVoiceProviders();
  }

  async generateCharacterVoice(options: VoiceGenerationOptions): Promise<string | null> {
    const cacheKey = `${options.character}-${options.emotion}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Try providers in order of preference (all free)
    const providers = [
      () => this.providers.tryiMyFoneFilme(options),
      () => this.providers.tryWebSpeechAPI(options),
      () => this.providers.tryResponsiveVoice(options),
      () => this.providers.tryTTSReader(options),
    ];

    for (const provider of providers) {
      const audioUrl = await provider();
      if (audioUrl) {
        this.cache.set(cacheKey, audioUrl);
        return audioUrl;
      }
    }

    return null;
  }

  // Generate short emotional sounds instead of full speech
  async generateEmotionalSound(character: string, emotion: string): Promise<string | null> {
    const phrases: { [key: string]: { [key: string]: string[] } } = {
      'rick sanchez (c-137)': {
        'drunk': ['*burp*', 'Ugh, whatever', '*hic*'],
        'angry': ['What the hell?!', 'Are you kidding me?!', 'Seriously?!'],
        'excited': ['Woo! Science!', 'Yes! Portal gun!', 'Interdimensional!'],
        'dismissive': ['Whatever, sure', 'Uh-huh, right', 'Yeah, okay'],
        'sarcastic': ['Oh really?', 'How original', 'Brilliant']
      },
      'rick prime': {
        'superior': ['Pathetic', 'Obviously inferior', 'Weak'],
        'threatening': ['Don\'t test me', 'Wrong choice', 'You\'ll regret that'],
        'dismissive': ['Boring', 'Irrelevant', 'Meaningless'],
        'angry': ['Enough!', 'Silence!', 'Foolish!'],
        'amused': ['Amusing', 'How quaint', 'Predictable']
      },
      'morty smith': {
        'scared': ['Oh geez!', 'Aw man!', 'Oh no, oh no!'],
        'nervous': ['Um, well...', 'I don\'t know...', 'Maybe?'],
        'excited': ['Wow! Really?!', 'That\'s amazing!', 'Cool!'],
        'confused': ['What? Huh?', 'I don\'t get it', 'Wait, what?'],
        'determined': ['I can do this!', 'I\'ll try!', 'Let\'s go!']
      },
      'evil morty': {
        'calculating': ['Interesting', 'As expected', 'Predictable'],
        'threatening': ['Finally', 'Perfect timing', 'Exactly as planned'],
        'smug': ['Obviously', 'How typical', 'Naturally'],
        'angry': ['Enough games', 'This ends now', 'Disappointing'],
        'satisfied': ['Perfect', 'Excellent', 'Flawless']
      }
    };

    const characterPhrases = phrases[character.toLowerCase()];
    if (!characterPhrases || !emotion) return null;
    
    const emotionPhrases = characterPhrases[emotion] || ['*sound*'];
    const phrase = emotionPhrases[Math.floor(Math.random() * emotionPhrases.length)];
    
    return this.generateCharacterVoice({
      text: phrase,
      character,
      emotion,
    });
  }
}

export const voiceService = new VoiceGenerationService();