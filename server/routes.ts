import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGameStateSchema, insertDialogueSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default characters
  await initializeCharacters();

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Character routes
  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.getCharacter(id);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  // Game state routes
  app.get("/api/game-state/:userId/:characterId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const characterId = parseInt(req.params.characterId);
      
      let gameState = await storage.getGameState(userId, characterId);
      
      if (!gameState) {
        // Create new game state
        gameState = await storage.createGameState({
          userId,
          characterId,
          affectionLevel: 0,
          relationshipStatus: "stranger",
          conversationCount: 0,
          currentEmotion: "neutral",
        });
      }

      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game state" });
    }
  });

  app.put("/api/game-state/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const gameState = await storage.updateGameState(id, updates);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ message: "Failed to update game state" });
    }
  });

  app.get("/api/user/:userId/game-states", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const gameStates = await storage.getUserGameStates(userId);
      res.json(gameStates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user game states" });
    }
  });

  // Dialogue routes
  app.get("/api/dialogues/:gameStateId", async (req, res) => {
    try {
      const gameStateId = parseInt(req.params.gameStateId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const dialogues = await storage.getDialogues(gameStateId, limit);
      res.json(dialogues.reverse()); // Return in chronological order
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dialogues" });
    }
  });

  app.post("/api/dialogues", async (req, res) => {
    try {
      const dialogueData = insertDialogueSchema.parse(req.body);
      const dialogue = await storage.createDialogue(dialogueData);
      
      // Update game state if affection changed
      if (dialogueData.affectionChange !== 0) {
        const gameState = await storage.getGameState(0, 0); // This would need proper user context
        // Update affection and conversation count logic here
      }

      res.json(dialogue);
    } catch (error) {
      res.status(400).json({ message: "Invalid dialogue data" });
    }
  });

  // AI conversation endpoint with OpenRouter API integration
  app.post("/api/conversation", async (req, res) => {
    try {
      const { characterId, message, gameStateId, apiKey, aiModel } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ 
          message: "OpenRouter API key is required. Please configure your API key in settings." 
        });
      }

      const character = await storage.getCharacter(characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const gameState = await storage.getGameState(0, characterId); // This would need proper user context
      
      // Get recent conversation history
      const recentDialogues = gameStateId ? 
        await storage.getDialogues(gameStateId, 10) : [];

      // Format conversation history for AI
      const conversationHistory = recentDialogues.map(d => ({
        role: d.speaker === 'user' ? 'user' : 'assistant',
        content: d.message,
        speaker: d.speaker
      }));

      // Call OpenRouter API with selected model
      const aiResponse = await generateOpenRouterResponse(
        character,
        message,
        conversationHistory,
        gameState?.affectionLevel || 0,
        gameState?.relationshipStatus || "stranger",
        apiKey,
        aiModel || "meta-llama/llama-3.1-8b-instruct:free"
      );

      // Calculate affection change based on response and current state
      const affectionChange = calculateAffectionChange(
        message,
        aiResponse,
        gameState?.affectionLevel || 0
      );

      // Determine emotion based on response content and affection
      const emotion = determineEmotionFromResponse(aiResponse, affectionChange);

      res.json({
        message: aiResponse,
        emotion: emotion,
        affectionChange: affectionChange
      });
    } catch (error) {
      console.error("Conversation API error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to generate response" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// OpenRouter API integration
async function generateOpenRouterResponse(
  character: any,
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string; speaker?: string }>,
  affectionLevel: number,
  relationshipStatus: string,
  apiKey: string,
  model: string = "deepseek/deepseek-chat-v3-0324:free"
): Promise<string> {
  const systemPrompt = createSystemPrompt(character, affectionLevel, relationshipStatus);
  const messages = formatMessages(systemPrompt, conversationHistory, userMessage);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://rick-morty-dating-sim.replit.app',
      'X-Title': 'Rick and Morty Dating Simulator'
    },
    body: JSON.stringify({
      model: model,
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

  const data = await response.json();
  
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response generated from OpenRouter API');
  }

  return data.choices[0].message.content.trim();
}

function createSystemPrompt(character: any, affectionLevel: number, relationshipStatus: string): string {
  const relationshipContext = getRelationshipContext(affectionLevel, relationshipStatus);
  
  return `You are ${character.name} from Rick and Morty. You must stay in character at all times.

PERSONALITY: ${character.personality}

CHARACTER TRAITS: ${character.traits?.join(', ') || 'genius, cynical, alcoholic'}

SPEECH PATTERN: Use the character's unique speech patterns and vocabulary

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

function getRelationshipContext(affectionLevel: number, relationshipStatus: string): string {
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

function formatMessages(
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

function calculateAffectionChange(userMessage: string, aiResponse: string, currentAffection: number): number {
  // Simple affection calculation based on message sentiment
  const positiveWords = ['love', 'like', 'amazing', 'wonderful', 'great', 'awesome', 'cool', 'fantastic'];
  const negativeWords = ['hate', 'dislike', 'boring', 'stupid', 'dumb', 'annoying', 'terrible'];
  
  const userLower = userMessage.toLowerCase();
  const responseLower = aiResponse.toLowerCase();
  
  let change = 0;
  
  // Check user message sentiment
  if (positiveWords.some(word => userLower.includes(word))) {
    change += 1;
  }
  if (negativeWords.some(word => userLower.includes(word))) {
    change -= 1;
  }
  
  // Check AI response sentiment
  if (responseLower.includes('*burp*') || responseLower.includes('wubba lubba dub dub')) {
    change += 1; // Rick's catchphrases are endearing
  }
  if (responseLower.includes('oh geez') || responseLower.includes('aw man')) {
    change += 1; // Morty's nervousness is cute
  }
  
  // Cap affection changes based on current level
  if (currentAffection > 80 && change > 0) {
    change = Math.min(change, 1); // Slower growth at high levels
  }
  
  return Math.max(-2, Math.min(2, change)); // Cap between -2 and 2
}

function determineEmotionFromResponse(response: string, affectionChange: number): string {
  const responseLower = response.toLowerCase();
  
  if (affectionChange > 0) {
    return 'happy';
  } else if (affectionChange < 0) {
    return 'annoyed';
  } else if (responseLower.includes('*burp*') || responseLower.includes('wubba lubba dub dub')) {
    return 'drunk';
  } else if (responseLower.includes('oh geez') || responseLower.includes('aw man')) {
    return 'nervous';
  } else if (responseLower.includes('?')) {
    return 'curious';
  } else {
    return 'neutral';
  }
}

// Initialize default characters
async function initializeCharacters() {
  const characters = await storage.getAllCharacters();
  
  if (characters.length === 0) {
    const defaultCharacters = [
      {
        name: "Rick Sanchez (C-137)",
        description: "Genius scientist with drinking problem and zero filter",
        personality: "Sarcastic, brilliant, nihilistic, interdimensional traveler with a drinking problem. Often burps mid-sentence and has zero patience for stupidity.",
        sprite: "flask",
        color: "#00ff41",
        traits: ["genius", "alcoholic", "sarcastic", "nihilistic", "scientist"],
        emotionStates: ["neutral", "drunk", "angry", "excited", "dismissive", "amused"]
      },
      {
        name: "Morty Smith",
        description: "Anxious teenager dragged into interdimensional adventures",
        personality: "Nervous, honest, sweet, morally conscious teenager who stutters when anxious and genuinely cares about others.",
        sprite: "user-graduate",
        color: "#ffeb3b",
        traits: ["anxious", "kind", "moral", "innocent", "stuttering"],
        emotionStates: ["neutral", "nervous", "happy", "scared", "confused", "determined"]
      },
      {
        name: "Evil Morty",
        description: "The Morty who escaped the Central Finite Curve",
        personality: "Strategic, calculated, manipulative, intelligent. The most dangerous Morty who orchestrated his escape from Rick's control.",
        sprite: "eye-slash",
        color: "#ff5722",
        traits: ["calculating", "manipulative", "intelligent", "cold", "strategic"],
        emotionStates: ["neutral", "smug", "angry", "calculating", "satisfied", "threatening"]
      },
      {
        name: "Rick Prime",
        description: "The Rick who killed C-137's family",
        personality: "Cold, efficient, superior, villainous. The most ruthless Rick who considers himself above all other Ricks.",
        sprite: "skull",
        color: "#9c27b0",
        traits: ["ruthless", "superior", "cold", "efficient", "villainous"],
        emotionStates: ["neutral", "superior", "angry", "dismissive", "threatening", "amused"]
      }
    ];

    for (const char of defaultCharacters) {
      try {
        await storage.createCharacter(char);
      } catch (error) {
        console.error(`Failed to create character ${char.name}:`, error);
      }
    }
  }
}

// Generate character-specific responses
function generateCharacterResponse(character: any, message: string) {
  const responses: { [key: string]: any } = {
    "Rick Sanchez (C-137)": {
      message: "*burp* Oh great, another philosophical question. Look, I don't have time to explain quantum mechanics to someone who probably thinks a microwave is advanced technology. *takes drink*",
      emotion: "drunk",
      affectionChange: Math.random() > 0.7 ? 1 : 0
    },
    "Morty Smith": {
      message: "Oh jeez, th-that's actually a really good question! I-I mean, I'm not sure I'm the right person to ask, but I think... *nervous laugh* ...I think it's important to be honest, you know?",
      emotion: "nervous",
      affectionChange: Math.random() > 0.5 ? 1 : 0
    },
    "Evil Morty": {
      message: "Interesting. Most people don't bother asking questions like that. Tell me, what makes you think I'd give you an honest answer? *adjusts eyepatch* Everything's calculated, including this conversation.",
      emotion: "calculating",
      affectionChange: Math.random() > 0.8 ? 1 : -1
    },
    "Rick Prime": {
      message: "You want to understand me? How quaint. I'm the Rick who made the choice to be truly free. Every other Rick is just a pale imitation playing with their little toys. *cold stare*",
      emotion: "superior",
      affectionChange: Math.random() > 0.9 ? 1 : 0
    }
  };

  return responses[character.name] || {
    message: "That's an interesting perspective.",
    emotion: "neutral",
    affectionChange: 0
  };
}
