import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { characterConfig } from "@/lib/characters";
import rickImage from "@assets/rick.jpg";
import mortyImage from "@assets/morty.jpg";
import evilMortyImage from "@assets/evil-morty.png";
import rickPrimeImage from "@assets/RICKPRIME.webp";

interface CharacterSpriteProps {
  character: any;
  emotion?: string;
  size?: "small" | "medium" | "large" | "extra-large";
  className?: string;
  style?: React.CSSProperties;
}

const sizeClasses = {
  small: "w-12 h-12 text-lg",
  medium: "w-16 h-16 text-2xl",
  large: "w-24 h-24 text-3xl",
  "extra-large": "w-32 h-32 text-4xl",
};

const emotionEffects = {
  neutral: {},
  happy: { scale: 1.1, rotate: 5 },
  angry: { scale: 1.2, rotate: -5 },
  sad: { scale: 0.9 },
  excited: { scale: 1.15, rotate: 10 },
  drunk: { scale: 1.05, rotate: -10 },
  nervous: { scale: 0.95 },
  scared: { scale: 0.85 },
  confused: { scale: 0.9, rotate: 15 },
  determined: { scale: 1.1 },
  smug: { scale: 1.1, rotate: 3 },
  calculating: { scale: 1.05 },
  satisfied: { scale: 1.1 },
  cold: { scale: 0.95 },
  superior: { scale: 1.2 },
  dismissive: { scale: 1.05, rotate: -3 },
  threatening: { scale: 1.15, rotate: -8 },
  amused: { scale: 1.08, rotate: 5 },
};

const emotionIcons = {
  neutral: "😐",
  happy: "😊",
  angry: "😠",
  sad: "😢",
  excited: "😄",
  drunk: "🥴",
  nervous: "😰",
  scared: "😨",
  confused: "😕",
  determined: "😤",
  smug: "😏",
  calculating: "🤔",
  satisfied: "😌",
  cold: "😑",
  superior: "😤",
  dismissive: "🙄",
  threatening: "😈",
  amused: "😆",
};

const characterImages = {
  "Rick Sanchez (C-137)": rickImage,
  "Morty Smith": mortyImage,
  "Evil Morty": evilMortyImage,
  "Rick Prime": rickPrimeImage,
};

export default function CharacterSprite({ 
  character, 
  emotion = "neutral", 
  size = "medium",
  className,
  style 
}: CharacterSpriteProps) {
  const config = characterConfig[character?.name] || characterConfig.default;
  const emotionTransform = emotionEffects[emotion as keyof typeof emotionEffects] || {};
  const emotionIcon = emotionIcons[emotion as keyof typeof emotionIcons] || "😐";
  const characterImage = characterImages[character?.name as keyof typeof characterImages];

  return (
    <div className="relative inline-block">
      {/* Main Character Sprite */}
      <motion.div
        className={cn(
          "character-sprite flex items-center justify-center rounded-full relative overflow-hidden",
          sizeClasses[size],
          className
        )}
        style={{
          backgroundColor: "transparent",
          color: config.textColor,
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
          ...style,
        }}
        animate={emotionTransform}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20,
          duration: 0.5 
        }}
        whileHover={{ 
          scale: 1.1,
          transition: { duration: 0.2 }
        }}
      >
        {/* Character Image or Fallback Icon */}
        {characterImage ? (
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <img 
              src={characterImage} 
              alt={character?.name || "Character"}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <i className={`fas fa-${config.icon}`} />
        )}
        
        {/* Portal Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${config.color}20 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Emotion Indicator */}
      <motion.div 
        className={cn(
          "absolute -top-1 -right-1 rounded-full border-2 border-background flex items-center justify-center text-xs",
          size === "small" ? "w-6 h-6" : size === "medium" ? "w-8 h-8" : "w-10 h-10"
        )}
        style={{
          backgroundColor: config.color,
          color: config.textColor,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 25,
          delay: 0.2 
        }}
        key={emotion} // Re-animate when emotion changes
      >
        <span className="filter drop-shadow-sm">
          {emotionIcon}
        </span>
      </motion.div>

      {/* Character-specific Special Effects */}
      {character?.name === "Rick Sanchez (C-137)" && emotion === "drunk" && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="absolute -top-2 -right-2 text-xs">💨</div>
        </motion.div>
      )}

      {character?.name === "Evil Morty" && (
        <motion.div
          className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-background"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        />
      )}

      {/* Portal Particles for Rick Prime */}
      {character?.name === "Rick Prime" && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              style={{
                top: `${20 + i * 20}%`,
                left: `${20 + i * 20}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
