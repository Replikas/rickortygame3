import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Heart, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AffectionMeterProps {
  level: number;
  status: string;
  className?: string;
}

const relationshipLevels = [
  { min: 0, max: 19, name: "Stranger", color: "text-gray-400", icon: "👤" },
  { min: 20, max: 39, name: "Acquaintance", color: "text-blue-400", icon: "🤝" },
  { min: 40, max: 59, name: "Friend", color: "text-green-400", icon: "😊" },
  { min: 60, max: 79, name: "Close Friend", color: "text-yellow-400", icon: "😄" },
  { min: 80, max: 94, name: "Love Interest", color: "text-pink-400", icon: "💕" },
  { min: 95, max: 100, name: "Soulmate", color: "text-red-400", icon: "💖" },
];

const getRelationshipLevel = (level: number) => {
  return relationshipLevels.find(rel => level >= rel.min && level <= rel.max) || relationshipLevels[0];
};

const getStatusMessage = (level: number, characterName?: string) => {
  const char = characterName?.split(' ')[0] || "They";
  
  if (level < 20) return `${char} barely knows you exist`;
  if (level < 40) return `${char} finds you somewhat interesting`;
  if (level < 60) return `${char} enjoys your company`;
  if (level < 80) return `${char} really likes spending time with you`;
  if (level < 95) return `${char} has strong feelings for you`;
  return `${char} is completely devoted to you`;
};

export default function AffectionMeter({ level, status, className }: AffectionMeterProps) {
  const currentLevel = Math.max(0, Math.min(100, level));
  const relationship = getRelationshipLevel(currentLevel);
  const nextLevel = relationshipLevels.find(rel => rel.min > currentLevel);
  
  // Calculate progress within current relationship tier
  const tierProgress = ((currentLevel - relationship.min) / (relationship.max - relationship.min)) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Relationship Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium">Affection Level</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Level</span>
          <motion.span 
            className="text-primary font-bold"
            key={Math.floor(currentLevel / 20) + 1}
            initial={{ scale: 1.5, color: "#00ff41" }}
            animate={{ scale: 1, color: "#00cc33" }}
            transition={{ duration: 0.3 }}
          >
            {Math.floor(currentLevel / 20) + 1}
          </motion.span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Progress 
            value={currentLevel} 
            className="h-3 bg-muted/30 border border-border/30"
          />
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 h-3 rounded-full opacity-50 pointer-events-none"
            style={{
              background: `linear-gradient(to right, transparent ${currentLevel}%, ${relationship.color.replace('text-', '')} ${currentLevel}%)`,
              filter: "blur(4px)",
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Level markers */}
          {relationshipLevels.slice(1).map((rel, index) => (
            <div
              key={index}
              className="absolute top-0 w-0.5 h-3 bg-border/50"
              style={{ left: `${rel.min}%` }}
            />
          ))}
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentLevel}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Current Relationship Status */}
      <div className="glass-morphism/20 rounded-lg p-3 border border-border/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{relationship.icon}</span>
            <span className={cn("font-medium", relationship.color)}>
              {relationship.name}
            </span>
          </div>
          
          {/* Special badges */}
          {currentLevel >= 80 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
            >
              {currentLevel >= 95 ? (
                <Crown className="w-4 h-4 text-yellow-400" />
              ) : (
                <Star className="w-4 h-4 text-pink-400" />
              )}
            </motion.div>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {getStatusMessage(currentLevel)}
        </p>

        {/* Next level progress */}
        {nextLevel && (
          <div className="mt-3 pt-2 border-t border-border/20">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">
                Progress to {nextLevel.name}:
              </span>
              <span className={cn("font-medium", nextLevel.color)}>
                {Math.round(tierProgress)}%
              </span>
            </div>
            <div className="mt-1 w-full bg-muted/20 rounded-full h-1">
              <motion.div
                className="h-1 rounded-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${tierProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Milestone Indicators */}
      <div className="flex justify-center space-x-2">
        {relationshipLevels.map((rel, index) => (
          <motion.div
            key={index}
            className={cn(
              "w-2 h-2 rounded-full border transition-all duration-300",
              currentLevel >= rel.min 
                ? "bg-primary border-primary shadow-sm shadow-primary/50" 
                : "bg-muted border-border/30"
            )}
            whileHover={{ scale: 1.2 }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
          />
        ))}
      </div>
    </div>
  );
}
