// Local types for client-side storage
interface User {
  id: number;
  username: string;
}

interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
  sprite: string;
  color: string;
  traits: string[];
  emotionStates: string[];
}

interface GameState {
  id: number;
  userId: number;
  characterId: number;
  affectionLevel: number;
  relationshipStatus: string;
  conversationCount: number;
  currentEmotion: string;
  settings: {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    animationSpeed: string;
    particleEffects: boolean;
    portalGlow: boolean;
    autosaveFrequency: number;
    typingSpeed: string;
    nsfwContent: boolean;
    openrouterApiKey: string;
    aiModel: string;
  };
  unlockedBackstories: string[];
  createdAt: string;
  updatedAt: string;
}

interface Dialogue {
  id: number;
  gameStateId: number;
  speaker: string;
  message: string;
  createdAt: string;
}

interface SaveSlot {
  id: number;
  userId: number;
  slotNumber: number;
  gameStateSnapshot: any;
  dialogueCount: number;
  characterName: string;
  affectionLevel: number;
  relationshipStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_USER: 'rick_morty_dating_sim_current_user',
  CHARACTERS: 'rick_morty_dating_sim_characters',
  GAME_STATES: 'rick_morty_dating_sim_game_states',
  DIALOGUES: 'rick_morty_dating_sim_dialogues',
  SAVE_SLOTS: 'rick_morty_dating_sim_save_slots',
  NEXT_IDS: 'rick_morty_dating_sim_next_ids'
} as const;

// Helper functions for localStorage operations
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// ID management
function getNextId(entity: string): number {
  const nextIds = getFromStorage(STORAGE_KEYS.NEXT_IDS, {} as Record<string, number>);
  const currentId = nextIds[entity] || 1;
  nextIds[entity] = currentId + 1;
  setToStorage(STORAGE_KEYS.NEXT_IDS, nextIds);
  return currentId;
}

// User operations
export function getCurrentUser(): User | null {
  return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(user: User | null): void {
  setToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function createUser(username: string): User {
  const user: User = {
    id: getNextId('user'),
    username,
  };
  setCurrentUser(user);
  return user;
}

// Character operations
export function getAllCharacters(): Character[] {
  return getFromStorage<Character[]>(STORAGE_KEYS.CHARACTERS, []);
}

export function setCharacters(characters: Character[]): void {
  setToStorage(STORAGE_KEYS.CHARACTERS, characters);
}

export function getCharacter(id: number): Character | undefined {
  const characters = getAllCharacters();
  return characters.find(char => char.id === id);
}

// Game state operations
export function getAllGameStates(): GameState[] {
  return getFromStorage<GameState[]>(STORAGE_KEYS.GAME_STATES, []);
}

export function setGameStates(gameStates: GameState[]): void {
  setToStorage(STORAGE_KEYS.GAME_STATES, gameStates);
}

export function getGameState(userId: number, characterId: number): GameState | undefined {
  const gameStates = getAllGameStates();
  return gameStates.find(gs => gs.userId === userId && gs.characterId === characterId);
}

export function createGameState(userId: number, characterId: number): GameState {
  const gameState: GameState = {
    id: getNextId('gameState'),
    userId,
    characterId,
    affectionLevel: 0,
    relationshipStatus: 'stranger',
    conversationCount: 0,
    currentEmotion: 'neutral',
    settings: {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      animationSpeed: 'normal',
      particleEffects: true,
      portalGlow: true,
      autosaveFrequency: 5,
      typingSpeed: 'normal',
      nsfwContent: false,
      openrouterApiKey: '',
      aiModel: 'anthropic/claude-3-haiku'
    },
    unlockedBackstories: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const gameStates = getAllGameStates();
  gameStates.push(gameState);
  setGameStates(gameStates);
  return gameState;
}

export function updateGameState(gameStateId: number, updates: Partial<GameState>): GameState | undefined {
  const gameStates = getAllGameStates();
  const index = gameStates.findIndex(gs => gs.id === gameStateId);
  
  if (index === -1) return undefined;
  
  gameStates[index] = {
    ...gameStates[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  setGameStates(gameStates);
  return gameStates[index];
}

// Dialogue operations
export function getAllDialogues(): Dialogue[] {
  return getFromStorage<Dialogue[]>(STORAGE_KEYS.DIALOGUES, []);
}

export function setDialogues(dialogues: Dialogue[]): void {
  setToStorage(STORAGE_KEYS.DIALOGUES, dialogues);
}

export function getDialogues(gameStateId: number, limit = 50): Dialogue[] {
  const dialogues = getAllDialogues();
  return dialogues
    .filter(d => d.gameStateId === gameStateId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-limit);
}

export function createDialogue(gameStateId: number, speaker: string, message: string): Dialogue {
  const dialogue: Dialogue = {
    id: getNextId('dialogue'),
    gameStateId,
    speaker,
    message,
    createdAt: new Date().toISOString()
  };
  
  const dialogues = getAllDialogues();
  dialogues.push(dialogue);
  setDialogues(dialogues);
  return dialogue;
}

// Save slot operations
export function getAllSaveSlots(): SaveSlot[] {
  return getFromStorage<SaveSlot[]>(STORAGE_KEYS.SAVE_SLOTS, []);
}

export function setSaveSlots(saveSlots: SaveSlot[]): void {
  setToStorage(STORAGE_KEYS.SAVE_SLOTS, saveSlots);
}

export function getSaveSlots(userId: number): SaveSlot[] {
  const saveSlots = getAllSaveSlots();
  return saveSlots.filter(slot => slot.userId === userId);
}

export function getSaveSlot(userId: number, slotNumber: number): SaveSlot | undefined {
  const saveSlots = getAllSaveSlots();
  return saveSlots.find(slot => slot.userId === userId && slot.slotNumber === slotNumber);
}

export function createSaveSlot(userId: number, slotNumber: number, gameStateSnapshot: any, characterName: string, affectionLevel: number, relationshipStatus: string, dialogueCount: number): SaveSlot {
  const saveSlot: SaveSlot = {
    id: getNextId('saveSlot'),
    userId,
    slotNumber,
    gameStateSnapshot,
    dialogueCount,
    characterName,
    affectionLevel,
    relationshipStatus,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const saveSlots = getAllSaveSlots();
  // Remove existing save slot with same user and slot number
  const filteredSlots = saveSlots.filter(slot => !(slot.userId === userId && slot.slotNumber === slotNumber));
  filteredSlots.push(saveSlot);
  setSaveSlots(filteredSlots);
  return saveSlot;
}

export function deleteSaveSlot(userId: number, slotNumber: number): void {
  const saveSlots = getAllSaveSlots();
  const filteredSlots = saveSlots.filter(slot => !(slot.userId === userId && slot.slotNumber === slotNumber));
  setSaveSlots(filteredSlots);
}

// Backstory operations
export function unlockBackstory(gameStateId: number, backstoryId: string): GameState | undefined {
  const gameStates = getAllGameStates();
  const gameState = gameStates.find(gs => gs.id === gameStateId);
  
  if (!gameState) return undefined;
  
  if (!gameState.unlockedBackstories || !gameState.unlockedBackstories.includes(backstoryId)) {
    if (!gameState.unlockedBackstories) gameState.unlockedBackstories = [];
    gameState.unlockedBackstories.push(backstoryId);
    gameState.updatedAt = new Date().toISOString();
    setGameStates(gameStates);
  }
  
  return gameState;
}

export function getUnlockedBackstories(gameStateId: number): string[] {
  const gameStates = getAllGameStates();
  const gameState = gameStates.find(gs => gs.id === gameStateId);
  return gameState?.unlockedBackstories || [];
}

// Data export/import for backup
export function exportAllData() {
  return {
    currentUser: getCurrentUser(),
    characters: getAllCharacters(),
    gameStates: getAllGameStates(),
    dialogues: getAllDialogues(),
    saveSlots: getAllSaveSlots(),
    nextIds: getFromStorage(STORAGE_KEYS.NEXT_IDS, {}),
    exportDate: new Date().toISOString()
  };
}

export function importAllData(data: any) {
  try {
    if (data.currentUser) setCurrentUser(data.currentUser);
    if (data.characters) setCharacters(data.characters);
    if (data.gameStates) setGameStates(data.gameStates);
    if (data.dialogues) setDialogues(data.dialogues);
    if (data.saveSlots) setSaveSlots(data.saveSlots);
    if (data.nextIds) setToStorage(STORAGE_KEYS.NEXT_IDS, data.nextIds);
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}

// Clear all data
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}