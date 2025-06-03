// Voice generation service for Rick and Morty characters
export interface VoiceGenerationOptions {
  text: string;
  character: string;
  emotion?: string;
}

export interface VoiceProvider {
  name: string;
  generateSpeech(options: VoiceGenerationOptions): Promise<string | null>;
}

// Free TTS services that might have Rick and Morty voices
class FreeVoiceProviders {
  
  // Try Uberduck.ai (has Rick and Morty voices)
  async tryUberduck(options: VoiceGenerationOptions): Promise<string | null> {
    try {
      const voiceId = this.getUberduckVoiceId(options.character);
      if (!voiceId) return null;

      const response = await fetch('https://api.uberduck.ai/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          speech: options.text,
          voice: voiceId,
        })
      });

      if (!response.ok) return null;
      
      const data = await response.json();
      return data.audio_url || null;
    } catch (error) {
      console.log('Uberduck failed:', error);
      return null;
    }
  }

  // Try FakeYou.com (community voices)
  async tryFakeYou(options: VoiceGenerationOptions): Promise<string | null> {
    try {
      const voiceId = this.getFakeYouVoiceId(options.character);
      if (!voiceId) return null;

      const response = await fetch('https://api.fakeyou.com/tts/inference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          voice_token: voiceId,
        })
      });

      if (!response.ok) return null;
      
      const data = await response.json();
      return data.inference_job_token ? 
        `https://storage.googleapis.com/vocodes-public/${data.inference_job_token}/audio.wav` : 
        null;
    } catch (error) {
      console.log('FakeYou failed:', error);
      return null;
    }
  }

  // Try OpenAI TTS (if API key provided)
  async tryOpenAI(options: VoiceGenerationOptions): Promise<string | null> {
    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          character: options.character,
          emotion: options.emotion,
        })
      });

      if (!response.ok) return null;
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.log('OpenAI TTS failed:', error);
      return null;
    }
  }

  private getUberduckVoiceId(character: string): string | null {
    const voiceMap: { [key: string]: string } = {
      'rick sanchez (c-137)': 'rick-sanchez',
      'rick prime': 'rick-sanchez',
      'morty smith': 'morty-smith',
      'evil morty': 'morty-smith',
    };
    
    return voiceMap[character.toLowerCase()] || null;
  }

  private getFakeYouVoiceId(character: string): string | null {
    const voiceMap: { [key: string]: string } = {
      'rick sanchez (c-137)': 'TM:rick_sanchez',
      'rick prime': 'TM:rick_sanchez',
      'morty smith': 'TM:morty_smith',
      'evil morty': 'TM:morty_smith',
    };
    
    return voiceMap[character.toLowerCase()] || null;
  }
}

export class VoiceGenerationService {
  private providers: FreeVoiceProviders;
  private cache = new Map<string, string>();

  constructor() {
    this.providers = new FreeVoiceProviders();
  }

  async generateCharacterVoice(options: VoiceGenerationOptions): Promise<string | null> {
    const cacheKey = `${options.character}-${options.emotion}-${options.text.substring(0, 50)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Try providers in order of preference
    const providers = [
      () => this.providers.tryOpenAI(options),
      () => this.providers.tryUberduck(options),
      () => this.providers.tryFakeYou(options),
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
    const emotionalPhrases: { [key: string]: { [key: string]: string[] } } = {
      'rick sanchez (c-137)': {
        'drunk': ['*burp*', 'Ugh...', '*hic*'],
        'angry': ['What?!', 'Seriously?!', 'Oh come on!'],
        'excited': ['Woo!', 'Yes!', '*laughs*'],
        'dismissive': ['Whatever.', 'Sure.', 'Uh-huh.'],
      },
      'rick prime': {
        'superior': ['Pathetic.', 'Obviously.', 'Inferior.'],
        'threatening': ['Don\'t.', 'Try me.', 'Wrong move.'],
        'dismissive': ['Boring.', 'Weak.', 'Pointless.'],
      },
      'morty smith': {
        'scared': ['Oh geez!', 'Aw man!', 'Oh no!'],
        'nervous': ['Um...', 'Well...', 'I don\'t know...'],
        'excited': ['Wow!', 'Really?!', 'That\'s great!'],
      },
      'evil morty': {
        'calculating': ['Hmm.', 'Interesting.', 'I see.'],
        'threatening': ['Finally.', 'Perfect.', 'As expected.'],
      }
    };

    const phrases = emotionalPhrases[character.toLowerCase()]?.[emotion];
    if (!phrases) return null;

    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    return this.generateCharacterVoice({
      text: randomPhrase,
      character,
      emotion,
    });
  }
}

export const voiceService = new VoiceGenerationService();