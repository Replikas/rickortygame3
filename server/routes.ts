import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertGameStateSchema, insertDialogueSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render
  app.get("/", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "Rick and Morty Dating Simulator is running!",
      timestamp: new Date().toISOString() 
    });
  });

  app.get("/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      uptime: process.uptime(),
      timestamp: new Date().toISOString() 
    });
  });

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

      res.json({ id: user.id, username: user.username, profilePicture: user.profilePicture });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User profile routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.patch("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Validate allowed updates
      const allowedUpdates = ['username', 'email', 'profilePicture'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);

      const user = await storage.updateUser(userId, filteredUpdates);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
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
      
      console.log("Updating game state:", id, updates);
      const gameState = await storage.updateGameState(id, updates);
      res.json(gameState);
    } catch (error) {
      console.error("Game state update error:", error);
      res.status(500).json({ message: "Failed to update game state", error: error.message });
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
      console.log("Creating dialogue with data:", req.body);
      const dialogueData = insertDialogueSchema.parse(req.body);
      const dialogue = await storage.createDialogue(dialogueData);
      res.json(dialogue);
    } catch (error) {
      console.error("Dialogue creation error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid dialogue data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create dialogue" });
      }
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

  // Generate dynamic response choices
  app.post("/api/generate-choices", async (req: Request, res: Response) => {
    try {
      const { characterId, conversationHistory } = req.body;

      const character = await storage.getCharacter(characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const gameState = await storage.getGameState(1, characterId);
      if (!gameState) {
        return res.status(404).json({ message: "Game state not found" });
      }

      const choices = await generateDynamicChoices(
        character,
        conversationHistory || [],
        gameState.affectionLevel,
        gameState.relationshipStatus
      );

      res.json({ choices });
    } catch (error) {
      console.error("Choice generation error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to generate choices" 
      });
    }
  });

  // Save game state to slot
  app.post("/api/save-game", async (req: Request, res: Response) => {
    try {
      const { userId, slotNumber, gameStateId } = req.body;
      
      if (!userId || !slotNumber || !gameStateId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const gameState = await storage.getGameState(userId, gameStateId);
      if (!gameState) {
        return res.status(404).json({ message: "Game state not found" });
      }

      const character = await storage.getCharacter(gameState.characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const dialogues = await storage.getDialogues(gameState.id);
      
      const saveSlot = await storage.createSaveSlot({
        userId,
        slotNumber,
        gameStateSnapshot: gameState as any,
        dialogueCount: dialogues.length,
        characterName: character.name,
        affectionLevel: gameState.affectionLevel,
        relationshipStatus: gameState.relationshipStatus
      });

      res.json(saveSlot);
    } catch (error) {
      console.error("Save game error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to save game" 
      });
    }
  });

  // Load game state from slot
  app.post("/api/load-game", async (req: Request, res: Response) => {
    try {
      const { userId, slotNumber } = req.body;
      
      if (!userId || !slotNumber) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const saveSlot = await storage.getSaveSlot(userId, slotNumber);
      if (!saveSlot) {
        return res.status(404).json({ message: "Save slot not found" });
      }

      // Restore the game state
      const restoredGameState = await storage.updateGameState(
        saveSlot.gameStateSnapshot.id,
        saveSlot.gameStateSnapshot as any
      );

      res.json({ 
        gameState: restoredGameState,
        saveInfo: {
          characterName: saveSlot.characterName,
          affectionLevel: saveSlot.affectionLevel,
          relationshipStatus: saveSlot.relationshipStatus,
          dialogueCount: saveSlot.dialogueCount,
          savedAt: saveSlot.updatedAt
        }
      });
    } catch (error) {
      console.error("Load game error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to load game" 
      });
    }
  });

  // Get save slots for user
  app.get("/api/save-slots/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const saveSlots = await storage.getSaveSlots(userId);
      res.json(saveSlots);
    } catch (error) {
      console.error("Get save slots error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to get save slots" 
      });
    }
  });

  // Delete save slot
  app.delete("/api/save-slots/:userId/:slotNumber", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const slotNumber = parseInt(req.params.slotNumber);
      
      if (isNaN(userId) || isNaN(slotNumber)) {
        return res.status(400).json({ message: "Invalid parameters" });
      }

      await storage.deleteSaveSlot(userId, slotNumber);
      res.json({ message: "Save slot deleted successfully" });
    } catch (error) {
      console.error("Delete save slot error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to delete save slot" 
      });
    }
  });

  // Unlock backstory
  app.post("/api/unlock-backstory", async (req: Request, res: Response) => {
    try {
      const { gameStateId, backstoryId } = req.body;
      
      if (!gameStateId || !backstoryId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const updatedGameState = await storage.unlockBackstory(gameStateId, backstoryId);
      res.json({ 
        gameState: updatedGameState,
        unlockedBackstory: backstoryId
      });
    } catch (error) {
      console.error("Unlock backstory error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to unlock backstory" 
      });
    }
  });

  // Generate backstory dialogue
  app.post("/api/backstory-dialogue", async (req: Request, res: Response) => {
    try {
      const { characterId, backstoryId, gameStateId } = req.body;
      
      if (!characterId || !backstoryId || !gameStateId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const character = await storage.getCharacter(characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const gameState = await storage.getGameState(1, characterId);
      if (!gameState) {
        return res.status(404).json({ message: "Game state not found" });
      }

      const backstoryPrompt = generateBackstoryPrompt(character.name, backstoryId);
      const aiResponse = await generateOpenRouterResponse(
        character,
        backstoryPrompt,
        [],
        gameState.affectionLevel,
        gameState.relationshipStatus
      );

      // Create backstory dialogue entry
      const dialogue = await storage.createDialogue({
        gameStateId,
        speaker: "character",
        message: aiResponse,
        messageType: "backstory",
        backstoryId,
        affectionChange: 0,
        emotionTriggered: "nostalgic"
      });

      res.json({
        message: aiResponse,
        backstoryId,
        dialogue
      });
    } catch (error) {
      console.error("Backstory dialogue error:", error);
      res.status(500).json({ 
        message: (error as Error).message || "Failed to generate backstory dialogue" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateBackstoryPrompt(characterName: string, backstoryId: string): string {
  const backstoryTemplates: { [key: string]: { [key: string]: string } } = {
    "Rick Sanchez (C-137)": {
      "diane_tragedy": "Tell me about Diane and Beth. What happened the day Rick Prime killed them? How did that moment change everything for you? You've spent decades hunting him - what kept you going all those years?",
      "invention_portal": "Talk about when you first invented portal travel. What was it like to discover the infinite multiverse? Did you know what it would cost you?",
      "abandoning_beth": "Why did you abandon Beth when she was young? What made you leave your family behind? Do you regret missing her childhood?",
      "bird_person": "Tell me about your friendship with Bird Person. What was the war like? How did you feel when you had to turn him into Phoenix Person?",
      "unity": "What was your relationship with Unity really like? Why did you try to kill yourself when it ended? What did that collective mean to you?"
    },
    "Morty Smith": {
      "cronenberg_world": "Tell me about the day you had to bury your own body and move to a new dimension. How did that change how you see reality?",
      "purge_planet": "What was it like on the Purge Planet when you snapped and killed all those people? Do you remember what it felt like?",
      "evil_morty_trauma": "How did it feel to discover Evil Morty and realize what Rick really does to Mortys? Did it change how you see yourself?",
      "jessica_crush": "Talk about Jessica. What's it like having feelings for someone in a world where nothing seems to matter anymore?",
      "family_dysfunction": "What's it like being caught between your parents' divorce while also going on interdimensional adventures? How do you handle the chaos?"
    },
    "Evil Morty": {
      "tortured_by_rick": "Tell me about the Rick who tortured you. What experiments did he do? How long did it last before you escaped?",
      "taking_control": "Describe the moment you first took control of your Rick. What was it like to turn the tables? How did it feel to have power?",
      "citadel_infiltration": "Walk me through your plan to infiltrate and take over the Citadel. How long were you planning it? How did you stay hidden?",
      "curve_escape": "What was it like to finally escape the Central Finite Curve? After all that planning, did freedom feel like you expected?",
      "morty_philosophy": "What do you think about other Mortys who still follow their Ricks? Do you see them as victims or willing participants?"
    },
    "Rick Prime": {
      "diane_murder": "Tell me about the day you killed Diane and Beth. What drove you to target Rick C-137's family? Was it just to prove a point?",
      "omega_device": "Explain the Omega Device. Why did you create something that could eliminate Diane across all realities? What were you trying to achieve?",
      "rick_rivalry": "What makes Rick C-137 so interesting to you? Why him specifically out of all the Ricks in the multiverse?",
      "power_philosophy": "You call yourself 'the Infinite Rick, a GOD.' What does that power mean to you? How does it feel to be truly superior?",
      "family_abandonment": "You abandoned your own Beth and never looked back. Do you ever think about the family you left behind? Do they matter at all?"
    }
  };

  const characterTemplates = backstoryTemplates[characterName];
  if (!characterTemplates || !characterTemplates[backstoryId]) {
    return `Tell me about your past. Share something personal and meaningful about who you are, ${characterName}.`;
  }

  return characterTemplates[backstoryId];
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
  
  // Rick-specific negative triggers (things that annoy him)
  const rickAnnoyances = ['marry me', 'love you', 'hot', 'sexy', 'baby', 'daddy', 'cute', 'adorable', 'uwu', 'simp', 'crush'];
  const wastingTimeWords = ['hi', 'hello', 'hey', 'sup', 'test', 'testing', 'lol', 'haha', 'ok', 'yeah', 'sure'];
  const stupidQuestions = ['how are you', 'what\'s up', 'nice weather', 'favorite color', 'favorite food'];
  
  // Strong negative reactions for Rick
  if (rickAnnoyances.some(word => userLower.includes(word))) {
    change -= 2; // Rick hates romantic/flirty approaches
  }
  if (wastingTimeWords.some(word => userLower === word.trim())) {
    change -= 1; // Rick hates time-wasters
  }
  if (stupidQuestions.some(phrase => userLower.includes(phrase))) {
    change -= 1; // Rick hates small talk
  }
  
  // Positive triggers
  const positiveWords = ['science', 'dimension', 'portal', 'intelligent', 'genius', 'impressive', 'adventure', 'experiment'];
  const respectfulWords = ['please', 'thank you', 'appreciate', 'respect', 'understand'];
  
  if (positiveWords.some(word => userLower.includes(word))) {
    change += 1; // Rick likes intellectual topics
  }
  if (respectfulWords.some(word => userLower.includes(word))) {
    change += 0.5; // Moderate appreciation for respect
  }
  
  // Analyze Rick's response tone for additional context
  const dismissiveResponses = ['whatever', 'don\'t care', 'waste', 'boring', 'stupid', 'pathetic', 'get out'];
  const engagedResponses = ['interesting', 'listen', 'actually', 'science', 'dimension'];
  
  if (dismissiveResponses.some(word => responseLower.includes(word))) {
    change -= 0.5; // Rick being dismissive indicates negative reaction
  }
  if (engagedResponses.some(word => responseLower.includes(word))) {
    change += 0.5; // Rick engaging indicates positive reaction
  }
  
  // Question engagement (shows genuine curiosity)
  if (userMessage.includes('?') && userMessage.length > 10) {
    change += 0.3; // Reward thoughtful questions
  }
  
  // Length consideration (but not for spam)
  if (userMessage.length > 50 && !rickAnnoyances.some(word => userLower.includes(word))) {
    change += 0.2; // Reward thoughtful, longer responses
  }
  
  // Diminishing returns at higher affection levels
  if (currentAffection > 80 && change > 0) {
    change = change * 0.5;
  }
  if (currentAffection > 60 && change > 0) {
    change = change * 0.8;
  }
  
  // Ensure we return an integer between -3 and 3
  return Math.max(-3, Math.min(3, Math.round(change)));
}

async function generateDynamicChoices(
  character: any,
  conversationHistory: Array<{ role: string; content: string; speaker?: string }>,
  affectionLevel: number,
  relationshipStatus: string
): Promise<Array<{ type: string; text: string; affectionPotential: number }>> {
  // Generate contextual choices based on conversation history and character
  const recentMessages = conversationHistory.slice(-4);
  const lastMessage = recentMessages[recentMessages.length - 1]?.content || '';
  
  return generateContextualChoices(character, lastMessage, affectionLevel, relationshipStatus, conversationHistory);
}

function generateContextualChoices(character: any, lastMessage: string, affectionLevel: number, relationshipStatus: string, conversationHistory: any[]) {
  const characterName = character.name.toLowerCase();
  const messageLower = lastMessage.toLowerCase();
  const conversationCount = conversationHistory.length;
  
  // Create pools of varied responses for each type
  const choicePools = getChoicePoolsForCharacter(characterName, affectionLevel, relationshipStatus);
  
  // Generate contextual variations based on recent conversation
  const contextualChoices = [];
  
  // Flirt choice - varies based on relationship progress
  const flirtOptions = choicePools.flirt;
  let flirtChoice = flirtOptions[conversationCount % flirtOptions.length];
  if (messageLower.includes('science') && characterName.includes('rick')) {
    flirtChoice = { ...flirtChoice, text: "Your intellect is incredibly attractive" };
  } else if (messageLower.includes('adventure') && characterName.includes('morty')) {
    flirtChoice = { ...flirtChoice, text: "You're braver than you realize" };
  }
  contextualChoices.push(flirtChoice);
  
  // Challenge choice - varies based on what they just said
  const challengeOptions = choicePools.challenge;
  let challengeChoice = challengeOptions[conversationCount % challengeOptions.length];
  if (messageLower.includes('drunk') || messageLower.includes('flask')) {
    challengeChoice = { ...challengeChoice, text: "Maybe you should lay off the alcohol" };
  } else if (messageLower.includes('smart') || messageLower.includes('genius')) {
    challengeChoice = { ...challengeChoice, text: "Intelligence without wisdom is just dangerous" };
  }
  contextualChoices.push(challengeChoice);
  
  // Support choice - varies based on emotional content
  const supportOptions = choicePools.support;
  let supportChoice = supportOptions[conversationCount % supportOptions.length];
  if (messageLower.includes('morty') && characterName.includes('rick')) {
    supportChoice = { ...supportChoice, text: "You really do care about Morty, don't you?" };
  } else if (messageLower.includes('rick') && characterName.includes('morty')) {
    supportChoice = { ...supportChoice, text: "Rick's lucky to have someone like you" };
  }
  contextualChoices.push(supportChoice);
  
  // Curious choice - varies based on topics mentioned
  const curiousOptions = choicePools.curious;
  let curiousChoice = curiousOptions[conversationCount % curiousOptions.length];
  if (messageLower.includes('dimension') || messageLower.includes('portal')) {
    curiousChoice = { ...curiousChoice, text: "What's the strangest dimension you've been to?" };
  } else if (messageLower.includes('family') || messageLower.includes('home')) {
    curiousChoice = { ...curiousChoice, text: "Do you ever miss having a normal life?" };
  }
  contextualChoices.push(curiousChoice);
  
  return contextualChoices;
}

function getChoicePoolsForCharacter(characterName: string, affectionLevel: number, relationshipStatus: string) {
  if (characterName.includes('rick')) {
    return {
      flirt: [
        { type: "flirt", text: "You're brilliant and dangerous... I like that", affectionPotential: 2 },
        { type: "flirt", text: "Your cynicism is oddly charming", affectionPotential: 1 },
        { type: "flirt", text: "There's something attractive about your confidence", affectionPotential: 2 },
        { type: "flirt", text: "You're not as heartless as you pretend to be", affectionPotential: 3 },
        { type: "flirt", text: "I find your intellect incredibly sexy", affectionPotential: 2 }
      ],
      challenge: [
        { type: "challenge", text: "I bet there's something even you can't figure out", affectionPotential: affectionLevel > 30 ? 1 : -1 },
        { type: "challenge", text: "Your attitude is getting old, Rick", affectionPotential: -1 },
        { type: "challenge", text: "You're not always right, you know", affectionPotential: 0 },
        { type: "challenge", text: "Stop hiding behind sarcasm", affectionPotential: 1 },
        { type: "challenge", text: "You care more than you admit", affectionPotential: 2 }
      ],
      support: [
        { type: "support", text: "Behind all that cynicism, you're actually trying to help", affectionPotential: 2 },
        { type: "support", text: "You've been through a lot, haven't you?", affectionPotential: 2 },
        { type: "support", text: "It must be lonely being the smartest person alive", affectionPotential: 3 },
        { type: "support", text: "You don't have to carry everything alone", affectionPotential: 2 },
        { type: "support", text: "Even geniuses need someone to talk to", affectionPotential: 2 }
      ],
      curious: [
        { type: "curious", text: "What's your greatest scientific achievement?", affectionPotential: 1 },
        { type: "curious", text: "Do you ever regret any of your inventions?", affectionPotential: 1 },
        { type: "curious", text: "What drives you to keep exploring?", affectionPotential: 1 },
        { type: "curious", text: "Have you ever met another Rick you respected?", affectionPotential: 1 },
        { type: "curious", text: "What's the most beautiful thing you've seen in your travels?", affectionPotential: 2 }
      ]
    };
  } else if (characterName.includes('rick prime') || characterName.includes('prime')) {
    return {
      flirt: [
        { type: "flirt", text: "You're different from other Ricks... more powerful", affectionPotential: 1 },
        { type: "flirt", text: "I admire your ruthless efficiency", affectionPotential: 2 },
        { type: "flirt", text: "You're the most dangerous Rick I've met", affectionPotential: 1 },
        { type: "flirt", text: "There's something compelling about your coldness", affectionPotential: 1 },
        { type: "flirt", text: "You make other Ricks look weak", affectionPotential: 2 }
      ],
      challenge: [
        { type: "challenge", text: "You're not as superior as you think", affectionPotential: -1 },
        { type: "challenge", text: "Even you must have weaknesses", affectionPotential: 0 },
        { type: "challenge", text: "Your ego will be your downfall", affectionPotential: -2 },
        { type: "challenge", text: "You're just another Rick with delusions", affectionPotential: -2 },
        { type: "challenge", text: "What makes you think you're better?", affectionPotential: -1 }
      ],
      support: [
        { type: "support", text: "You've transcended the limitations of other Ricks", affectionPotential: 2 },
        { type: "support", text: "Your methods are brutal but effective", affectionPotential: 1 },
        { type: "support", text: "You see the universe for what it really is", affectionPotential: 2 },
        { type: "support", text: "Lesser beings wouldn't understand your vision", affectionPotential: 2 },
        { type: "support", text: "You've achieved what others could never imagine", affectionPotential: 3 }
      ],
      curious: [
        { type: "curious", text: "What drove you to become the Rick you are?", affectionPotential: 1 },
        { type: "curious", text: "Do you ever feel anything besides superiority?", affectionPotential: 0 },
        { type: "curious", text: "What's your ultimate goal?", affectionPotential: 1 },
        { type: "curious", text: "How did you escape the Central Finite Curve?", affectionPotential: 1 },
        { type: "curious", text: "What do you think of C-137?", affectionPotential: 1 }
      ]
    };
  } else if (characterName.includes('morty')) {
    return {
      flirt: [
        { type: "flirt", text: "You're braver than you think, Morty", affectionPotential: 2 },
        { type: "flirt", text: "I love your kind heart", affectionPotential: 3 },
        { type: "flirt", text: "You're more mature than most adults", affectionPotential: 2 },
        { type: "flirt", text: "Your compassion is really attractive", affectionPotential: 2 },
        { type: "flirt", text: "You have beautiful eyes", affectionPotential: 2 }
      ],
      challenge: [
        { type: "challenge", text: "Why don't you stand up to Rick more?", affectionPotential: 0 },
        { type: "challenge", text: "You're stronger than you realize", affectionPotential: 1 },
        { type: "challenge", text: "Stop letting people walk all over you", affectionPotential: 1 },
        { type: "challenge", text: "You need to believe in yourself more", affectionPotential: 2 },
        { type: "challenge", text: "When will you stop being afraid?", affectionPotential: 0 }
      ],
      support: [
        { type: "support", text: "You've been through so much... you're stronger than you realize", affectionPotential: 3 },
        { type: "support", text: "It's okay to feel overwhelmed sometimes", affectionPotential: 2 },
        { type: "support", text: "You're doing your best in impossible situations", affectionPotential: 3 },
        { type: "support", text: "Your family is lucky to have you", affectionPotential: 2 },
        { type: "support", text: "You don't deserve all the trauma you've endured", affectionPotential: 3 }
      ],
      curious: [
        { type: "curious", text: "What's the worst adventure Rick dragged you on?", affectionPotential: 1 },
        { type: "curious", text: "Do you ever wish you had a normal life?", affectionPotential: 1 },
        { type: "curious", text: "What do you want to do when you grow up?", affectionPotential: 1 },
        { type: "curious", text: "How do you cope with all the crazy stuff?", affectionPotential: 2 },
        { type: "curious", text: "What's your favorite memory from before Rick?", affectionPotential: 2 }
      ]
    };
  } else {
    // Default pools for other characters
    return {
      flirt: [
        { type: "flirt", text: "There's something intriguing about you", affectionPotential: 2 },
        { type: "flirt", text: "You have an interesting perspective", affectionPotential: 1 },
        { type: "flirt", text: "I'm drawn to your mysterious nature", affectionPotential: 2 },
        { type: "flirt", text: "You're more complex than you appear", affectionPotential: 2 }
      ],
      challenge: [
        { type: "challenge", text: "I think you're underestimating me", affectionPotential: 1 },
        { type: "challenge", text: "That's not entirely accurate", affectionPotential: 0 },
        { type: "challenge", text: "You're avoiding the real issue", affectionPotential: 0 },
        { type: "challenge", text: "I disagree with that assessment", affectionPotential: 0 }
      ],
      support: [
        { type: "support", text: "You seem like you could use someone to talk to", affectionPotential: 2 },
        { type: "support", text: "That sounds really difficult", affectionPotential: 2 },
        { type: "support", text: "You're handling this well", affectionPotential: 2 },
        { type: "support", text: "I understand what you're going through", affectionPotential: 2 }
      ],
      curious: [
        { type: "curious", text: "Tell me more about yourself", affectionPotential: 1 },
        { type: "curious", text: "What's your story?", affectionPotential: 1 },
        { type: "curious", text: "How did you end up here?", affectionPotential: 1 },
        { type: "curious", text: "What motivates you?", affectionPotential: 1 }
      ]
    };
  }
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
