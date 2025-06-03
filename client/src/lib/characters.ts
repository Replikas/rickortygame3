// Character configuration and utility functions for the Rick and Morty Dating Simulator

export interface CharacterConfig {
  icon: string;
  color: string;
  gradient: string;
  textColor: string;
  hoverClass: string;
  buttonClass: string;
  stats: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
}

// Character-specific configurations matching the UI design
export const characterConfig: { [key: string]: CharacterConfig } = {
  "Rick Sanchez (C-137)": {
    icon: "flask",
    color: "#00ff41", // bright portal green
    gradient: "linear-gradient(45deg, #00ff41, #00cc33)",
    textColor: "#0f1419",
    hoverClass: "hover:shadow-green-400/50",
    buttonClass: "hover:from-green-600 hover:to-green-400",
    stats: [
      { name: "Intelligence", value: 5, color: "bg-green-400" },
      { name: "Chaos Level", value: 4, color: "bg-red-400" },
      { name: "Sarcasm", value: 5, color: "bg-orange-400" },
      { name: "Science Skills", value: 5, color: "bg-cyan-400" }
    ]
  },
  "Morty Smith": {
    icon: "user-graduate",
    color: "#ffcc00", // warm yellow
    gradient: "linear-gradient(45deg, #ffcc00, #fbbf24)",
    textColor: "#0f1419",
    hoverClass: "hover:shadow-yellow-400/50",
    buttonClass: "hover:from-yellow-500 hover:to-amber-400",
    stats: [
      { name: "Kindness", value: 5, color: "bg-green-400" },
      { name: "Anxiety Level", value: 4, color: "bg-yellow-400" },
      { name: "Moral Compass", value: 5, color: "bg-blue-400" },
      { name: "Bravery", value: 2, color: "bg-purple-400" }
    ]
  },
  "Evil Morty": {
    icon: "eye-slash",
    color: "#00ff41", // portal green (expert level)
    gradient: "linear-gradient(45deg, #00ff41, #00cc33)",
    textColor: "#0f1419",
    hoverClass: "hover:shadow-green-400/50",
    buttonClass: "hover:from-green-600 hover:to-green-400",
    stats: [
      { name: "Cunning", value: 5, color: "bg-red-400" },
      { name: "Trust Level", value: 1, color: "bg-gray-400" },
      { name: "Intelligence", value: 4, color: "bg-green-400" },
      { name: "Manipulation", value: 5, color: "bg-purple-400" }
    ]
  },
  "Rick Prime": {
    icon: "skull",
    color: "#ff4d00", // bright orange-red
    gradient: "linear-gradient(45deg, #ff4d00, #dc2626)",
    textColor: "#ffffff",
    hoverClass: "hover:shadow-orange-500/50",
    buttonClass: "hover:from-orange-600 hover:to-red-500",
    stats: [
      { name: "Ruthlessness", value: 5, color: "bg-red-500" },
      { name: "Empathy", value: 0, color: "bg-gray-400" },
      { name: "Power", value: 5, color: "bg-orange-500" },
      { name: "Superiority", value: 5, color: "bg-pink-400" }
    ]
  },
  default: {
    icon: "user",
    color: "#00ff41",
    gradient: "linear-gradient(45deg, #00ff41, #00cc33)",
    textColor: "#0f1419",
    hoverClass: "hover:shadow-green-400/50",
    buttonClass: "hover:from-green-600 hover:to-green-400",
    stats: [
      { name: "Unknown", value: 3, color: "bg-gray-400" }
    ]
  }
};

// Emotion state configurations
export const emotionConfig: { [key: string]: { 
  color: string; 
  description: string; 
  icon: string;
  animationEffect?: string;
} } = {
  neutral: {
    color: "#6b7280",
    description: "Calm and composed",
    icon: "😐"
  },
  happy: {
    color: "#10b981",
    description: "Feeling good",
    icon: "😊",
    animationEffect: "bounce"
  },
  angry: {
    color: "#ef4444",
    description: "Frustrated or mad",
    icon: "😠",
    animationEffect: "shake"
  },
  sad: {
    color: "#3b82f6",
    description: "Feeling down",
    icon: "😢"
  },
  excited: {
    color: "#f59e0b",
    description: "Full of energy",
    icon: "😄",
    animationEffect: "pulse"
  },
  drunk: {
    color: "#8b5cf6",
    description: "Under the influence",
    icon: "🥴",
    animationEffect: "wobble"
  },
  nervous: {
    color: "#eab308",
    description: "Anxious and worried",
    icon: "😰"
  },
  scared: {
    color: "#dc2626",
    description: "Frightened",
    icon: "😨"
  },
  confused: {
    color: "#6366f1",
    description: "Not understanding",
    icon: "😕"
  },
  determined: {
    color: "#059669",
    description: "Focused and resolved",
    icon: "😤"
  },
  smug: {
    color: "#7c2d12",
    description: "Self-satisfied",
    icon: "😏"
  },
  calculating: {
    color: "#1f2937",
    description: "Planning something",
    icon: "🤔"
  },
  satisfied: {
    color: "#065f46",
    description: "Content and pleased",
    icon: "😌"
  },
  cold: {
    color: "#374151",
    description: "Emotionally distant",
    icon: "😑"
  },
  superior: {
    color: "#7c2d12",
    description: "Feeling above others",
    icon: "😤"
  },
  dismissive: {
    color: "#6b7280",
    description: "Uninterested",
    icon: "🙄"
  },
  threatening: {
    color: "#991b1b",
    description: "Menacing",
    icon: "😈"
  },
  amused: {
    color: "#16a34a",
    description: "Finding something funny",
    icon: "😆"
  }
};

// Character personality traits and their descriptions
export const personalityTraits: { [key: string]: string } = {
  genius: "Exceptionally intelligent",
  alcoholic: "Has a drinking problem",
  sarcastic: "Uses irony and wit",
  nihilistic: "Believes life has no meaning",
  scientist: "Skilled in scientific research",
  anxious: "Prone to worry and stress",
  kind: "Shows compassion and care",
  moral: "Has strong ethical principles",
  innocent: "Pure and naive",
  stuttering: "Speaks with hesitation",
  calculating: "Plans everything carefully",
  manipulative: "Uses others for gain",
  intelligent: "Very smart and clever",
  cold: "Emotionally detached",
  strategic: "Thinks several steps ahead",
  ruthless: "Shows no mercy",
  superior: "Believes they are better",
  efficient: "Gets things done quickly",
  villainous: "Has evil intentions"
};

// Relationship status descriptions
export const relationshipStatuses: { [key: string]: { 
  description: string; 
  color: string; 
  icon: string;
} } = {
  stranger: {
    description: "You've just met",
    color: "#6b7280",
    icon: "👤"
  },
  acquaintance: {
    description: "Getting to know each other",
    color: "#3b82f6",
    icon: "🤝"
  },
  friend: {
    description: "Good friends",
    color: "#10b981",
    icon: "😊"
  },
  "close friend": {
    description: "Very close friendship",
    color: "#f59e0b",
    icon: "😄"
  },
  "love interest": {
    description: "Romantic feelings developing",
    color: "#ec4899",
    icon: "💕"
  },
  soulmate: {
    description: "Perfect match",
    color: "#ef4444",
    icon: "💖"
  }
};

// Utility functions for character management
export const getCharacterConfig = (characterName: string): CharacterConfig => {
  return characterConfig[characterName] || characterConfig.default;
};

export const getEmotionConfig = (emotion: string) => {
  return emotionConfig[emotion] || emotionConfig.neutral;
};

export const getRelationshipConfig = (status: string) => {
  return relationshipStatuses[status] || relationshipStatuses.stranger;
};

export const calculateRelationshipLevel = (affectionLevel: number): number => {
  return Math.floor(affectionLevel / 20) + 1;
};

export const getNextRelationshipMilestone = (affectionLevel: number): { 
  nextLevel: number; 
  progressToNext: number; 
  statusName: string;
} => {
  const currentLevel = Math.floor(affectionLevel / 20);
  const nextLevel = Math.min(currentLevel + 1, 5);
  const nextLevelThreshold = nextLevel * 20;
  const progressToNext = ((affectionLevel % 20) / 20) * 100;
  
  const statusNames = ["stranger", "acquaintance", "friend", "close friend", "love interest", "soulmate"];
  const statusName = statusNames[nextLevel] || "soulmate";
  
  return {
    nextLevel: nextLevelThreshold,
    progressToNext: Math.round(progressToNext),
    statusName
  };
};

// Character-specific dialogue patterns and speech quirks
export const characterSpeechPatterns: { [key: string]: {
  prefix?: string[];
  suffix?: string[];
  quirks?: string[];
  commonPhrases?: string[];
} } = {
  "Rick Sanchez (C-137)": {
    prefix: ["*burp*", "Listen", "Look", "Wubba lubba dub dub!"],
    quirks: ["*burp*", "*takes drink*", "*portal gun sounds*"],
    commonPhrases: [
      "I'm not a hero",
      "Science doesn't care about your feelings",
      "Existence is pain",
      "Nobody exists on purpose"
    ]
  },
  "Morty Smith": {
    prefix: ["Oh jeez", "I-I don't know", "Rick, I", "Aw man"],
    quirks: ["*nervous laugh*", "*stuttering*", "*anxious*"],
    commonPhrases: [
      "That's really messed up",
      "I just want to be normal",
      "Why does everything have to be so complicated?",
      "Can't we just talk about this?"
    ]
  },
  "Evil Morty": {
    prefix: ["Interesting", "How predictable", "You see"],
    quirks: ["*adjusts eyepatch*", "*cold stare*", "*calculating*"],
    commonPhrases: [
      "Every Rick thinks they're the smartest",
      "I'm the one who walks away",
      "Freedom is worth any price",
      "The game is rigged"
    ]
  },
  "Rick Prime": {
    prefix: ["You want to understand me?", "Pathetic", "I am"],
    quirks: ["*menacing smile*", "*cold laugh*", "*superior look*"],
    commonPhrases: [
      "I'm the Rick who made the choice",
      "Every other Rick is just a pale imitation",
      "Power is the only truth",
      "Sentiment is weakness"
    ]
  }
};

export const getCharacterSpeechPattern = (characterName: string) => {
  return characterSpeechPatterns[characterName] || {};
};

// Character emotion state transitions based on interaction types
export const emotionTransitions: { [key: string]: { [key: string]: string[] } } = {
  "Rick Sanchez (C-137)": {
    compliment: ["amused", "superior"],
    challenge: ["angry", "dismissive"],
    question: ["neutral", "drunk"],
    flirt: ["amused", "dismissive"]
  },
  "Morty Smith": {
    compliment: ["happy", "nervous"],
    challenge: ["scared", "determined"],
    question: ["nervous", "confused"],
    flirt: ["nervous", "happy"]
  },
  "Evil Morty": {
    compliment: ["smug", "calculating"],
    challenge: ["cold", "threatening"],
    question: ["calculating", "superior"],
    flirt: ["smug", "cold"]
  },
  "Rick Prime": {
    compliment: ["superior", "amused"],
    challenge: ["threatening", "angry"],
    question: ["dismissive", "superior"],
    flirt: ["amused", "dismissive"]
  }
};

export const getEmotionTransition = (characterName: string, interactionType: string): string => {
  const transitions = emotionTransitions[characterName];
  if (!transitions || !transitions[interactionType]) {
    return "neutral";
  }
  
  const possibleEmotions = transitions[interactionType];
  return possibleEmotions[Math.floor(Math.random() * possibleEmotions.length)];
};
