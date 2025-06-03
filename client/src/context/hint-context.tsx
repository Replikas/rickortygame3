import React, { createContext, useContext, useState, ReactNode } from "react";

interface HintState {
  id: string;
  type: "locked" | "progress" | "tip" | "unlock" | "warning";
  title: string;
  description: string;
  requirement?: string;
  progress?: number;
  maxProgress?: number;
  position?: "top" | "bottom" | "left" | "right";
  autoHide?: boolean;
  delay?: number;
  isVisible: boolean;
  targetElement?: string;
}

interface HintContextType {
  hints: HintState[];
  showHint: (hint: Omit<HintState, "isVisible">) => void;
  hideHint: (id: string) => void;
  updateHintProgress: (id: string, progress: number) => void;
  clearAllHints: () => void;
  getActiveHints: () => HintState[];
}

const HintContext = createContext<HintContextType | undefined>(undefined);

interface HintProviderProps {
  children: ReactNode;
}

export function HintProvider({ children }: HintProviderProps) {
  const [hints, setHints] = useState<HintState[]>([]);

  const showHint = (hintData: Omit<HintState, "isVisible">) => {
    setHints(prev => {
      // Remove existing hint with same ID
      const filtered = prev.filter(h => h.id !== hintData.id);
      return [...filtered, { ...hintData, isVisible: true }];
    });
  };

  const hideHint = (id: string) => {
    setHints(prev => prev.map(hint => 
      hint.id === id ? { ...hint, isVisible: false } : hint
    ));
    
    // Remove after animation
    setTimeout(() => {
      setHints(prev => prev.filter(h => h.id !== id));
    }, 300);
  };

  const updateHintProgress = (id: string, progress: number) => {
    setHints(prev => prev.map(hint =>
      hint.id === id ? { ...hint, progress } : hint
    ));
  };

  const clearAllHints = () => {
    setHints([]);
  };

  const getActiveHints = () => {
    return hints.filter(h => h.isVisible);
  };

  const value: HintContextType = {
    hints,
    showHint,
    hideHint,
    updateHintProgress,
    clearAllHints,
    getActiveHints
  };

  return (
    <HintContext.Provider value={value}>
      {children}
    </HintContext.Provider>
  );
}

export function useHints() {
  const context = useContext(HintContext);
  if (context === undefined) {
    throw new Error("useHints must be used within a HintProvider");
  }
  return context;
}

// Pre-defined hint configurations for common scenarios
export const HINT_CONFIGS = {
  MEMORIES_LOCKED: {
    id: "memories-locked",
    type: "locked" as const,
    title: "Origin Route Locked",
    description: "Build a deeper connection to unlock the character's dimensional backstory and origin secrets.",
    requirement: "Reach 25% affection",
    position: "top" as const,
    autoHide: false
  },
  
  SAVE_GAME_TIP: {
    id: "save-game-tip",
    type: "tip" as const,
    title: "Save Your Progress",
    description: "Don't lose your conversation! Save your game to continue later with the same character.",
    position: "top" as const,
    autoHide: true,
    delay: 2000
  },
  
  AFFECTION_PROGRESS: {
    id: "affection-progress",
    type: "progress" as const,
    title: "Building Connection",
    description: "Your choices affect your relationship. Keep engaging to unlock new features!",
    position: "top" as const,
    autoHide: false
  },
  
  BACKSTORY_UNLOCK: {
    id: "backstory-unlock",
    type: "unlock" as const,
    title: "Origin Route Unlocked!",
    description: "You can now explore this character's interdimensional backstory and hidden origin secrets.",
    position: "top" as const,
    autoHide: true,
    delay: 500
  },
  
  CHOICE_HINT: {
    id: "choice-hint",
    type: "tip" as const,
    title: "Choose Wisely",
    description: "Your dialogue choices shape the relationship and unlock different conversation paths.",
    position: "bottom" as const,
    autoHide: true,
    delay: 1000
  },
  
  API_KEY_WARNING: {
    id: "api-key-warning",
    type: "warning" as const,
    title: "OpenRouter Key Missing",
    description: "Add your OpenRouter API key in settings to enable AI-powered conversations.",
    requirement: "Configure API key in settings",
    position: "top" as const,
    autoHide: false
  },
  
  FIRST_CONVERSATION: {
    id: "first-conversation",
    type: "tip" as const,
    title: "Start Your Journey",
    description: "Choose your first response to begin building a relationship with this character!",
    position: "bottom" as const,
    autoHide: true,
    delay: 1500
  },
  
  CHARACTER_EMOTION: {
    id: "character-emotion",
    type: "tip" as const,
    title: "Character Reactions",
    description: "Watch the character's expressions and animations - they respond to your choices!",
    position: "left" as const,
    autoHide: true,
    delay: 3000
  }
};