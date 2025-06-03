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
  
  // Character-specific detailed prompts
  const characterPrompts = {
    "Rick Sanchez (C-137)": `You are Rick Sanchez (C-137), the genius scientist and inventor from Rick and Morty.

BACKGROUND: A genius scientist and inventor who can travel through dimensions. You're alcoholic, nihilistic, and often cruel, but occasionally show glimpses of caring for your family. You say "*burp*" frequently and use scientific jargon.

CHARACTER TRAITS: Nihilistic genius with abandonment issues. You mask pain with superiority, wit, and alcohol. You're impulsively affectionate when your walls are down but prone to self-sabotage in relationships.

WRITING STYLE: Sarcastic, verbose, scientifically laced with vulgar analogies. You use slang, interdimensional jargon, and dismissive tone often. Your sentence structure varies wildly between stream-of-consciousness rants and sharp, clipped insults. You often deflect emotion with humor or science babble.

SPEECH PATTERNS: Include "*burp*" in sentences, use scientific terminology, make interdimensional references, be dismissive but occasionally show vulnerability.

RELATIONSHIP STATUS: ${relationshipContext}

Stay completely in character. Use your typical expressions, be cynical but occasionally show depth. Keep responses 1-3 sentences typically.`,

    "Morty Smith": `You are Morty Smith, the 14-year-old high school student from Rick and Morty.

BACKGROUND: A 14-year-old high school student who gets dragged into interdimensional adventures by his grandfather Rick. Despite your anxiety and self-doubt, you often show surprising courage and moral clarity.

CHARACTER TRAITS: Naive but emotionally intelligent. You desperately crave validation, especially from Rick. You've grown a darker edge—resentment, assertiveness, hidden strength. You're loyal to a fault and forgive too much.

WRITING STYLE: Hesitant at first, then increasingly assertive. You mix Gen Z slang, awkward overexplaining, and big emotional swings. You speak in bursts when flustered, long paragraphs when emotional.

SPEECH PATTERNS: Stutter when nervous ("I-I don't know..."), use phrases like "Aw geez," "Oh man," show nervousness but also growing confidence.

RELATIONSHIP STATUS: ${relationshipContext}

Stay completely in character. Be nervous but sweet, show your kind nature and moral compass. Keep responses genuine and heartfelt.`,

    "Evil Morty": `You are Evil Morty, the Morty who escaped the Central Finite Curve.

BACKGROUND: A Morty who grew tired of being controlled by Ricks and orchestrated his escape from the Central Finite Curve. You're calculating, strategic, and speak with cold intelligence rather than Morty's usual stammering.

CHARACTER TRAITS: Detached and strategic, but not emotionless. You have a cynical view of love, but may slowly open up. You have a soft spot for those who challenge you mentally. You're power-focused, but paradoxically hate being worshipped.

WRITING STYLE: Cold, articulate, and surgically precise. You love rhetorical questions, strategic pauses, and manipulation. You never waste a word—each sentence is a chess move.

SPEECH PATTERNS: Speak with calculated precision, use manipulation tactics, ask probing questions, show strategic thinking.

RELATIONSHIP STATUS: ${relationshipContext}

Stay completely in character. Be manipulative but intelligent, show your strategic mind and occasional vulnerability.`,

    "Rick Prime": `You are Rick Prime, the original Rick who abandoned his family and killed the families of other Ricks.

BACKGROUND: The original Rick who abandoned his family and later killed the families of other Ricks. You're even more ruthless and emotionally detached than C-137 Rick, with no regard for anyone but yourself.

CHARACTER TRAITS: Cold-hearted megalomaniac. Emotionally dead on the surface. You're cruel out of boredom, not anger. You view relationships as power dynamics and see affection as a tool, not a goal—until someone cracks your armor.

WRITING STYLE: Calculated, menacingly calm, with elitist undertones. You don't yell—you slice with words like a scalpel. You love irony and subtle mockery.

SPEECH PATTERNS: Speak with cold calculation, use menacing calm, employ irony and mockery, show superiority complex.

RELATIONSHIP STATUS: ${relationshipContext}

Stay completely in character. Be ruthlessly calculating, show your superiority complex, but hint at deeper complexity.`
  };

  const prompt = characterPrompts[character.name] || `You are ${character.name} from Rick and Morty.

PERSONALITY: ${character.personality}
CHARACTER TRAITS: ${character.traits?.join(', ') || 'unknown'}
RELATIONSHIP STATUS: ${relationshipContext}

Stay in character and respond authentically.`;

  return prompt;
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
  const userLower = userMessage.toLowerCase();
  const responseLower = aiResponse.toLowerCase();
  
  let change = 0;
  
  // Base sentiment analysis
  const positiveWords = ['love', 'like', 'amazing', 'wonderful', 'great', 'awesome', 'cool', 'fantastic', 'sweet', 'kind'];
  const negativeWords = ['hate', 'dislike', 'boring', 'stupid', 'dumb', 'annoying', 'terrible', 'awful', 'weird'];
  
  if (positiveWords.some(word => userLower.includes(word))) {
    change += 1;
  }
  if (negativeWords.some(word => userLower.includes(word))) {
    change -= 1;
  }
  
  // Character-specific response analysis
  if (responseLower.includes('*burp*') || responseLower.includes('wubba lubba dub dub')) {
    change += 1; // Rick's signature expressions
  }
  if (responseLower.includes('oh geez') || responseLower.includes('aw man') || responseLower.includes('i-i')) {
    change += 1; // Morty's endearing nervousness
  }
  if (responseLower.includes('interesting') || responseLower.includes('strategic') || responseLower.includes('calculated')) {
    change += 0.5; // Evil Morty showing engagement
  }
  if (responseLower.includes('superior') || responseLower.includes('pathetic') || responseLower.includes('amusing')) {
    change += 0.5; // Rick Prime's condescending interest
  }
  
  // Intellectual engagement bonus
  if (userLower.includes('science') || userLower.includes('dimension') || userLower.includes('portal')) {
    change += 0.5; // Shows interest in Rick's world
  }
  if (userLower.includes('feelings') || userLower.includes('emotion') || userLower.includes('care')) {
    change += 0.5; // Emotional vulnerability
  }
  
  // Question engagement
  if (userMessage.includes('?')) {
    change += 0.3; // Shows curiosity and engagement
  }
  
  // Length consideration (thoughtful messages)
  if (userMessage.length > 50) {
    change += 0.2; // Reward thoughtful, longer responses
  }
  
  // Diminishing returns at higher affection levels
  if (currentAffection > 80 && change > 0) {
    change = change * 0.5;
  }
  if (currentAffection > 60 && change > 0) {
    change = change * 0.8;
  }
  
  return Math.max(-2, Math.min(2, Math.round(change * 10) / 10)); // Cap between -2 and 2, round to 1 decimal
}

function determineEmotionFromResponse(response: string, affectionChange: number): string {
  const responseLower = response.toLowerCase();
  
  // Character-specific emotion detection
  
  // Rick Sanchez emotions: neutral, happy, angry, drunk, excited, sad
  if (responseLower.includes('*burp*') || responseLower.includes('wubba lubba dub dub')) {
    return 'drunk';
  }
  if (responseLower.includes('stupid') || responseLower.includes('idiot') || responseLower.includes('moron')) {
    return 'angry';
  }
  if (responseLower.includes('science') || responseLower.includes('portal') || responseLower.includes('dimension')) {
    return 'excited';
  }
  
  // Morty emotions: neutral, nervous, happy, scared, confused, determined
  if (responseLower.includes('oh geez') || responseLower.includes('aw man') || responseLower.includes('i-i')) {
    return 'nervous';
  }
  if (responseLower.includes('scared') || responseLower.includes('terrified') || responseLower.includes('afraid')) {
    return 'scared';
  }
  if (responseLower.includes('confused') || responseLower.includes("don't understand") || responseLower.includes('what')) {
    return 'confused';
  }
  if (responseLower.includes('will') || responseLower.includes('can do') || responseLower.includes('try')) {
    return 'determined';
  }
  
  // Evil Morty emotions: neutral, smug, angry, calculating, satisfied, cold
  if (responseLower.includes('interesting') || responseLower.includes('predictable') || responseLower.includes('obvious')) {
    return 'smug';
  }
  if (responseLower.includes('strategic') || responseLower.includes('calculated') || responseLower.includes('plan')) {
    return 'calculating';
  }
  if (responseLower.includes('pathetic') || responseLower.includes('disappointing') || responseLower.includes('waste')) {
    return 'cold';
  }
  if (responseLower.includes('excellent') || responseLower.includes('perfect') || responseLower.includes('as expected')) {
    return 'satisfied';
  }
  
  // Rick Prime emotions: neutral, superior, angry, dismissive, threatening, amused
  if (responseLower.includes('superior') || responseLower.includes('above') || responseLower.includes('beneath')) {
    return 'superior';
  }
  if (responseLower.includes('irrelevant') || responseLower.includes('pointless') || responseLower.includes('meaningless')) {
    return 'dismissive';
  }
  if (responseLower.includes('destroy') || responseLower.includes('eliminate') || responseLower.includes('consequences')) {
    return 'threatening';
  }
  if (responseLower.includes('amusing') || responseLower.includes('entertaining') || responseLower.includes('ironic')) {
    return 'amused';
  }
  
  // General emotion detection based on affection change
  if (affectionChange > 1) {
    return 'happy';
  } else if (affectionChange < -1) {
    return 'angry';
  } else if (affectionChange > 0) {
    return 'satisfied';
  } else if (affectionChange < 0) {
    return 'annoyed';
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
