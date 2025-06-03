import { 
  type User, 
  type Character,
  type GameState,
  type Dialogue,
  type SaveSlot,
  type InsertUser,
  type InsertCharacter,
  type InsertGameState,
  type InsertDialogue,
  type InsertSaveSlot
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Character operations
  getAllCharacters(): Promise<Character[]>;
  getCharacter(id: number): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;

  // Game state operations
  getGameState(userId: number, characterId: number): Promise<GameState | undefined>;
  createGameState(gameState: InsertGameState): Promise<GameState>;
  updateGameState(id: number, updates: Partial<GameState>): Promise<GameState>;
  getUserGameStates(userId: number): Promise<GameState[]>;

  // Dialogue operations
  getDialogues(gameStateId: number, limit?: number): Promise<Dialogue[]>;
  createDialogue(dialogue: InsertDialogue): Promise<Dialogue>;

  // Save slot operations
  getSaveSlots(userId: number): Promise<SaveSlot[]>;
  getSaveSlot(userId: number, slotNumber: number): Promise<SaveSlot | undefined>;
  createSaveSlot(saveSlot: InsertSaveSlot): Promise<SaveSlot>;
  deleteSaveSlot(userId: number, slotNumber: number): Promise<void>;

  // Backstory operations
  unlockBackstory(gameStateId: number, backstoryId: string): Promise<GameState>;
  getUnlockedBackstories(gameStateId: number): Promise<string[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private characters: Map<number, Character> = new Map();
  private gameStates: Map<number, GameState> = new Map();
  private dialogues: Map<number, Dialogue[]> = new Map();
  private saveSlots: Map<string, SaveSlot> = new Map();
  private nextId = 1;

  constructor() {
    this.initializeCharacters();
  }

  private initializeCharacters() {
    // Rick and Morty characters for the dating simulator
    const rickCharacter: Character = {
      id: 1,
      name: "Rick Sanchez (C-137)",
      description: "Genius scientist with a drinking problem and zero filter",
      personality: "sarcastic, nihilistic, brilliant, unpredictable",
      sprite: "/attached_assets/rick.jpg",
      color: "#00ff88",
      traits: ["Genius IQ", "Alcoholic", "Nihilistic", "Unpredictable", "Sarcastic"],
      emotionStates: ["neutral", "annoyed", "drunk", "excited", "angry", "smug"]
    };

    const mortyCharacter: Character = {
      id: 2,
      name: "Morty Smith",
      description: "Anxious teenager dragged into interdimensional adventures",
      personality: "nervous, kind-hearted, insecure, loyal",
      sprite: "/attached_assets/morty.jpg",
      color: "#ffaa00",
      traits: ["Anxious", "Kind", "Insecure", "Loyal", "Naive"],
      emotionStates: ["neutral", "nervous", "excited", "scared", "happy", "confused"]
    };

    const evilMortyCharacter: Character = {
      id: 3,
      name: "Evil Morty",
      description: "The Morty who got tired of being Rick's sidekick",
      personality: "calculating, manipulative, intelligent, cold",
      sprite: "/attached_assets/evil-morty.png",
      color: "#ff4444",
      traits: ["Intelligent", "Manipulative", "Cold", "Calculating", "Ambitious"],
      emotionStates: ["neutral", "smug", "angry", "calculating", "satisfied", "menacing"]
    };

    this.characters.set(1, rickCharacter);
    this.characters.set(2, mortyCharacter);
    this.characters.set(3, evilMortyCharacter);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      username: insertUser.username,
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const newCharacter: Character = {
      id: this.nextId++,
      ...character,
    };
    this.characters.set(newCharacter.id, newCharacter);
    return newCharacter;
  }

  async getGameState(userId: number, characterId: number): Promise<GameState | undefined> {
    for (const gameState of this.gameStates.values()) {
      if (gameState.userId === userId && gameState.characterId === characterId) {
        return gameState;
      }
    }
    return undefined;
  }

  async createGameState(gameState: InsertGameState): Promise<GameState> {
    const newGameState: GameState = {
      id: this.nextId++,
      ...gameState,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.gameStates.set(newGameState.id, newGameState);
    return newGameState;
  }

  async updateGameState(id: number, updates: Partial<GameState>): Promise<GameState> {
    const gameState = this.gameStates.get(id);
    if (!gameState) {
      throw new Error("Game state not found");
    }
    const updatedGameState = { 
      ...gameState, 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.gameStates.set(id, updatedGameState);
    return updatedGameState;
  }

  async getUserGameStates(userId: number): Promise<GameState[]> {
    const userGameStates = Array.from(this.gameStates.values())
      .filter(gs => gs.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return userGameStates;
  }

  async getDialogues(gameStateId: number, limit = 50): Promise<Dialogue[]> {
    const dialogueList = this.dialogues.get(gameStateId) || [];
    return dialogueList
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createDialogue(dialogue: InsertDialogue): Promise<Dialogue> {
    const newDialogue: Dialogue = {
      id: this.nextId++,
      ...dialogue,
      timestamp: new Date().toISOString(),
    };
    
    const existingDialogues = this.dialogues.get(dialogue.gameStateId) || [];
    existingDialogues.push(newDialogue);
    this.dialogues.set(dialogue.gameStateId, existingDialogues);
    
    return newDialogue;
  }

  async getSaveSlots(userId: number): Promise<SaveSlot[]> {
    const userSaveSlots = Array.from(this.saveSlots.values())
      .filter(slot => slot.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return userSaveSlots;
  }

  async getSaveSlot(userId: number, slotNumber: number): Promise<SaveSlot | undefined> {
    const key = `${userId}-${slotNumber}`;
    return this.saveSlots.get(key);
  }

  async createSaveSlot(saveSlot: InsertSaveSlot): Promise<SaveSlot> {
    const newSaveSlot: SaveSlot = {
      id: this.nextId++,
      ...saveSlot,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const key = `${saveSlot.userId}-${saveSlot.slotNumber}`;
    this.saveSlots.set(key, newSaveSlot);
    return newSaveSlot;
  }

  async deleteSaveSlot(userId: number, slotNumber: number): Promise<void> {
    const key = `${userId}-${slotNumber}`;
    this.saveSlots.delete(key);
  }

  async unlockBackstory(gameStateId: number, backstoryId: string): Promise<GameState> {
    const gameState = this.gameStates.get(gameStateId);
    if (!gameState) {
      throw new Error("Game state not found");
    }

    const currentBackstories = gameState.unlockedBackstories || [];
    if (!currentBackstories.includes(backstoryId)) {
      const updatedBackstories = [...currentBackstories, backstoryId];
      const updatedGameState = {
        ...gameState,
        unlockedBackstories: updatedBackstories,
        updatedAt: new Date().toISOString()
      };
      this.gameStates.set(gameStateId, updatedGameState);
      return updatedGameState;
    }
    
    return gameState;
  }

  async getUnlockedBackstories(gameStateId: number): Promise<string[]> {
    const gameState = this.gameStates.get(gameStateId);
    return gameState?.unlockedBackstories || [];
  }
}

export const storage = new MemStorage();