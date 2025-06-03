interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface CharacterPersonality {
  name: string;
  personality: string;
  speechPattern: string;
  traits: string[];
}

export class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(
    character: CharacterPersonality,
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string; speaker?: string }> = [],
    affectionLevel: number = 0,
    relationshipStatus: string = "stranger"
  ): Promise<string> {
    if (!this.apiKey || this.apiKey.trim() === '') {
      throw new Error('OpenRouter API key is required. Please set your API key in settings.');
    }

    const systemPrompt = this.createSystemPrompt(character, affectionLevel, relationshipStatus);
    const messages = this.formatMessages(systemPrompt, conversationHistory, userMessage);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Rick and Morty Dating Simulator'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages,
          max_tokens: 300,
          temperature: 0.8,
          top_p: 0.9,
          frequency_penalty: 0.1,
          presence_penalty: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from OpenRouter API');
      }

      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenRouter API error:', error);
      throw error;
    }
  }

  private createSystemPrompt(
    character: CharacterPersonality,
    affectionLevel: number,
    relationshipStatus: string
  ): string {
    const relationshipContext = this.getRelationshipContext(affectionLevel, relationshipStatus);
    
    return `You are ${character.name} from Rick and Morty. You must stay in character at all times.

PERSONALITY: ${character.personality}

CHARACTER TRAITS: ${character.traits.join(', ')}

SPEECH PATTERN: ${character.speechPattern}

RELATIONSHIP STATUS: ${relationshipContext}

IMPORTANT GUIDELINES:
- Stay completely in character as ${character.name}
- Use the character's unique speech patterns and vocabulary
- Reference Rick and Morty universe elements naturally
- Keep responses engaging but not overly long (1-3 sentences typically)
- React appropriately to the current relationship level
- Be true to the character's personality - don't be overly agreeable if that's not how they are
- Use the character's typical expressions and mannerisms
- Remember this is a dating simulator context, but stay true to the character

Respond as ${character.name} would, maintaining their authentic voice and personality.`;
  }

  private getRelationshipContext(affectionLevel: number, relationshipStatus: string): string {
    if (affectionLevel < 20) {
      return "You barely know this person. Be somewhat distant or cautious.";
    } else if (affectionLevel < 40) {
      return "You're getting to know each other. Show mild interest.";
    } else if (affectionLevel < 60) {
      return "You're becoming friends. Be more open and friendly.";
    } else if (affectionLevel < 80) {
      return "You have a good connection. Show genuine interest and care.";
    } else {
      return "You have a strong bond. Be affectionate and deeply engaged.";
    }
  }

  private formatMessages(
    systemPrompt: string,
    conversationHistory: Array<{ role: string; content: string; speaker?: string }>,
    userMessage: string
  ) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add recent conversation history (last 10 messages to stay within context limits)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      if (msg.speaker === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else {
        messages.push({ role: 'assistant', content: msg.content });
      }
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  static isValidApiKey(apiKey: string): boolean {
    return apiKey.startsWith('sk-or-v1-') && apiKey.length > 20;
  }
}

export default OpenRouterService;