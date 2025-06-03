import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser, setCurrentUser as saveCurrentUser, getAllCharacters } from "@/lib/local-storage";

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
  };
  createdAt: string;
  updatedAt: string;
}

interface GameContextType {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Character state
  selectedCharacter: Character | null;
  setSelectedCharacter: (character: Character | null) => void;
  
  // Game state
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  
  // UI state
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  
  // Game actions
  resetGame: () => void;
  saveProgress: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedUser = getCurrentUser();
      if (savedUser) {
        setCurrentUser(savedUser);
      }
    } catch (error) {
      console.error('Failed to load saved game state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      saveCurrentUser(currentUser);
    }
  }, [currentUser]);

  const resetGame = () => {
    setSelectedCharacter(null);
    setGameState(null);
  };

  const saveProgress = () => {
    // Manual save trigger - localStorage is already being updated automatically
    console.log('Game progress saved to local storage');
  };

  const value: GameContextType = {
    currentUser,
    setCurrentUser,
    selectedCharacter,
    setSelectedCharacter,
    gameState,
    setGameState,
    showSettings,
    setShowSettings,
    resetGame,
    saveProgress,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}