import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Portal-themed utility functions
export function generatePortalGlow(intensity: number = 1, color: string = "#00ff41"): string {
  const opacity = Math.min(intensity, 1);
  return `0 0 ${20 * intensity}px ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

export function getPortalGradient(color1: string = "#00ff41", color2: string = "#00cc33"): string {
  return `linear-gradient(45deg, ${color1}, ${color2})`;
}

// Animation utilities
export function getRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Time formatting utilities
export function formatTimestamp(timestamp: string | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return date.toLocaleDateString();
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Color manipulation utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { 
    h: Math.round(h * 360), 
    s: Math.round(s * 100), 
    l: Math.round(l * 100) 
  };
}

export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#ffffff";
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length - 3) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Array utilities
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sample<T>(array: T[]): T | undefined {
  return array[Math.floor(Math.random() * array.length)];
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Local storage utilities with error handling
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    return false;
  }
}

export function removeFromStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error);
    return false;
  }
}

// Rick and Morty specific utilities
export function generatePortalParticle(): {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
} {
  return {
    id: Math.random().toString(36).substr(2, 9),
    x: getRandomFloat(0, 100),
    y: getRandomFloat(0, 100),
    size: getRandomFloat(1, 4),
    speed: getRandomFloat(0.5, 2),
    opacity: getRandomFloat(0.3, 0.8),
    color: sample(["#00ff41", "#00cc33", "#00ff88", "#00bcd4"]) || "#00ff41"
  };
}

export function calculateAffectionChange(
  messageType: "compliment" | "challenge" | "question" | "flirt" | "neutral",
  characterPersonality: string[]
): number {
  let baseChange = 0;
  
  switch (messageType) {
    case "compliment":
      baseChange = characterPersonality.includes("arrogant") ? 0 : 2;
      break;
    case "challenge":
      baseChange = characterPersonality.includes("competitive") ? 1 : -1;
      break;
    case "question":
      baseChange = characterPersonality.includes("knowledgeable") ? 2 : 1;
      break;
    case "flirt":
      baseChange = characterPersonality.includes("romantic") ? 3 : 1;
      break;
    case "neutral":
      baseChange = 0;
      break;
  }
  
  // Add some randomness
  const randomModifier = getRandomInt(-1, 1);
  return Math.max(-2, Math.min(3, baseChange + randomModifier));
}

export function getRelationshipTitle(affectionLevel: number): string {
  if (affectionLevel < 20) return "Stranger";
  if (affectionLevel < 40) return "Acquaintance";
  if (affectionLevel < 60) return "Friend";
  if (affectionLevel < 80) return "Close Friend";
  if (affectionLevel < 95) return "Love Interest";
  return "Soulmate";
}

// Debug utilities
export function debugLog(message: string, data?: any): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Rick & Morty Simulator] ${message}`, data || "");
  }
}

export function performanceTimer(label: string): () => void {
  const start = performance.now();
  return () => {
    const end = performance.now();
    debugLog(`${label} took ${(end - start).toFixed(2)}ms`);
  };
}

// Mobile detection
export function isMobile(): boolean {
  return window.innerWidth < 768;
}

export function isTouch(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Portal sound effects (placeholder for future audio implementation)
export function playPortalSound(soundType: "open" | "close" | "travel" | "error"): void {
  // Placeholder for sound effect implementation
  debugLog(`Playing portal sound: ${soundType}`);
}

// Typewriter effect utility
export function createTypewriterEffect(
  text: string,
  callback: (currentText: string, isComplete: boolean) => void,
  speed: number = 50
): () => void {
  let index = 0;
  const timer = setInterval(() => {
    if (index <= text.length) {
      callback(text.slice(0, index), index === text.length);
      index++;
    } else {
      clearInterval(timer);
    }
  }, speed);
  
  return () => clearInterval(timer);
}

// Gesture utilities for mobile
export interface SwipeGesture {
  direction: "left" | "right" | "up" | "down";
  distance: number;
  duration: number;
}

export function detectSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  startTime: number,
  endTime: number
): SwipeGesture | null {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const duration = endTime - startTime;
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Minimum swipe distance and maximum duration
  if (distance < 50 || duration > 1000) {
    return null;
  }
  
  const angle = Math.atan2(Math.abs(deltaY), Math.abs(deltaX)) * (180 / Math.PI);
  
  let direction: "left" | "right" | "up" | "down";
  
  if (angle < 45) {
    direction = deltaX > 0 ? "right" : "left";
  } else {
    direction = deltaY > 0 ? "down" : "up";
  }
  
  return { direction, distance, duration };
}
