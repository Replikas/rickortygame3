import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  personality: text("personality").notNull(),
  sprite: text("sprite").notNull(),
  color: text("color").notNull(),
  traits: jsonb("traits").$type<string[]>().notNull(),
  emotionStates: jsonb("emotion_states").$type<string[]>().notNull(),
});

export const gameStates = pgTable("game_states", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  characterId: integer("character_id").notNull(),
  affectionLevel: integer("affection_level").default(0),
  relationshipStatus: text("relationship_status").default("stranger"),
  conversationCount: integer("conversation_count").default(0),
  currentEmotion: text("current_emotion").default("neutral"),
  settings: jsonb("settings").$type<{
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    animationSpeed: string;
    particleEffects: boolean;
    portalGlow: boolean;
    autosaveFrequency: number;
    typingSpeed: string;
    nsfwContent: boolean;
  }>().default({
    masterVolume: 75,
    sfxVolume: 50,
    musicVolume: 25,
    animationSpeed: "normal",
    particleEffects: true,
    portalGlow: true,
    autosaveFrequency: 5,
    typingSpeed: "normal",
    nsfwContent: false,
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dialogues = pgTable("dialogues", {
  id: serial("id").primaryKey(),
  gameStateId: integer("game_state_id").notNull(),
  speaker: text("speaker").notNull(), // "character" or "player"
  message: text("message").notNull(),
  messageType: text("message_type").notNull(), // "choice", "custom", "character"
  affectionChange: integer("affection_change").default(0),
  emotionTriggered: text("emotion_triggered"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const gameStatesRelations = relations(gameStates, ({ one, many }) => ({
  user: one(users, {
    fields: [gameStates.userId],
    references: [users.id],
  }),
  character: one(characters, {
    fields: [gameStates.characterId],
    references: [characters.id],
  }),
  dialogues: many(dialogues),
}));

export const dialoguesRelations = relations(dialogues, ({ one }) => ({
  gameState: one(gameStates, {
    fields: [dialogues.gameStateId],
    references: [gameStates.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  gameStates: many(gameStates),
}));

export const charactersRelations = relations(characters, ({ many }) => ({
  gameStates: many(gameStates),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export const insertGameStateSchema = createInsertSchema(gameStates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDialogueSchema = createInsertSchema(dialogues).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type GameState = typeof gameStates.$inferSelect;
export type Dialogue = typeof dialogues.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type InsertGameState = z.infer<typeof insertGameStateSchema>;
export type InsertDialogue = z.infer<typeof insertDialogueSchema>;
