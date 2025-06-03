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

  // AI conversation endpoint (would integrate with OpenRouter API)
  app.post("/api/conversation", async (req, res) => {
    try {
      const { characterId, message, gameStateId } = req.body;
      
      // This would integrate with OpenRouter API for AI responses
      // For now, return a sample response based on character
      const character = await storage.getCharacter(characterId);
      
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      // Generate AI response based on character personality
      const response = generateCharacterResponse(character, message);
      
      res.json({
        message: response.message,
        emotion: response.emotion,
        affectionChange: response.affectionChange
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
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
      await storage.createCharacter(char);
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
