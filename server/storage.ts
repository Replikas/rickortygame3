import { 
  users, 
  characters, 
  gameStates, 
  dialogues,
  saveSlots,
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
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllCharacters(): Promise<Character[]> {
    return await db.select().from(characters);
  }

  async getCharacter(id: number): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character || undefined;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db
      .insert(characters)
      .values(character)
      .returning();
    return newCharacter;
  }

  async getGameState(userId: number, characterId: number): Promise<GameState | undefined> {
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(and(eq(gameStates.userId, userId), eq(gameStates.characterId, characterId)));
    return gameState || undefined;
  }

  async createGameState(gameState: InsertGameState): Promise<GameState> {
    const [newGameState] = await db
      .insert(gameStates)
      .values(gameState)
      .returning();
    return newGameState;
  }

  async updateGameState(id: number, updates: Partial<GameState>): Promise<GameState> {
    const [updatedGameState] = await db
      .update(gameStates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(gameStates.id, id))
      .returning();
    return updatedGameState;
  }

  async getUserGameStates(userId: number): Promise<GameState[]> {
    return await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.userId, userId))
      .orderBy(desc(gameStates.updatedAt));
  }

  async getDialogues(gameStateId: number, limit = 50): Promise<Dialogue[]> {
    return await db
      .select()
      .from(dialogues)
      .where(eq(dialogues.gameStateId, gameStateId))
      .orderBy(desc(dialogues.timestamp))
      .limit(limit);
  }

  async createDialogue(dialogue: InsertDialogue): Promise<Dialogue> {
    const [newDialogue] = await db
      .insert(dialogues)
      .values(dialogue)
      .returning();
    return newDialogue;
  }

  async getSaveSlots(userId: number): Promise<SaveSlot[]> {
    return await db
      .select()
      .from(saveSlots)
      .where(eq(saveSlots.userId, userId))
      .orderBy(desc(saveSlots.updatedAt));
  }

  async getSaveSlot(userId: number, slotNumber: number): Promise<SaveSlot | undefined> {
    const [saveSlot] = await db
      .select()
      .from(saveSlots)
      .where(and(eq(saveSlots.userId, userId), eq(saveSlots.slotNumber, slotNumber)));
    return saveSlot || undefined;
  }

  async createSaveSlot(saveSlot: InsertSaveSlot): Promise<SaveSlot> {
    // Delete existing save in this slot first
    await db
      .delete(saveSlots)
      .where(and(eq(saveSlots.userId, saveSlot.userId), eq(saveSlots.slotNumber, saveSlot.slotNumber)));
    
    const [newSaveSlot] = await db
      .insert(saveSlots)
      .values({ ...saveSlot, updatedAt: new Date() })
      .returning();
    return newSaveSlot;
  }

  async deleteSaveSlot(userId: number, slotNumber: number): Promise<void> {
    await db
      .delete(saveSlots)
      .where(and(eq(saveSlots.userId, userId), eq(saveSlots.slotNumber, slotNumber)));
  }

  async unlockBackstory(gameStateId: number, backstoryId: string): Promise<GameState> {
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.id, gameStateId));
    
    if (!gameState) {
      throw new Error('Game state not found');
    }

    const currentBackstories = gameState.unlockedBackstories || [];
    if (!currentBackstories.includes(backstoryId)) {
      const updatedBackstories = [...currentBackstories, backstoryId];
      const [updatedGameState] = await db
        .update(gameStates)
        .set({ unlockedBackstories: updatedBackstories, updatedAt: new Date() })
        .where(eq(gameStates.id, gameStateId))
        .returning();
      return updatedGameState;
    }

    return gameState;
  }

  async getUnlockedBackstories(gameStateId: number): Promise<string[]> {
    const [gameState] = await db
      .select()
      .from(gameStates)
      .where(eq(gameStates.id, gameStateId));
    
    return gameState?.unlockedBackstories || [];
  }
}

export const storage = new DatabaseStorage();
