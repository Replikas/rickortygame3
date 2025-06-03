import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HeartCrack, Zap, Flame, Skull, Star } from "lucide-react";

interface CharacterReactionsProps {
  character: any;
  lastMessage: string;
  affectionChange?: number;
}

const reactionTriggers = {
  positive: ["love", "like", "amazing", "awesome", "brilliant", "smart", "handsome", "beautiful", "cute"],
  negative: ["hate", "stupid", "dumb", "ugly", "boring", "annoying", "weird"],
  rick_specific: ["science", "portal", "burp", "drink", "alcohol", "dimension", "morty", "genius"],
  morty_specific: ["school", "jessica", "scared", "nervous", "adventure", "grandpa"],
  flirty: ["hot", "sexy", "kiss", "date", "romance", "love"]
};

const reactions = {
  rick: {
    positive: { icon: Zap, text: "*burp* Not terrible...", color: "text-green-400" },
    negative: { icon: Skull, text: "*burp* Whatever, your loss", color: "text-red-400" },
    flirty: { icon: Flame, text: "*burp* Save it for someone who cares", color: "text-orange-400" },
    science: { icon: Star, text: "*burp* Finally, someone with half a brain", color: "text-blue-400" }
  },
  morty: {
    positive: { icon: Heart, text: "Aw geez, th-thanks!", color: "text-pink-400" },
    negative: { icon: HeartCrack, text: "W-why would you say that?", color: "text-red-400" },
    flirty: { icon: Heart, text: "Oh w-wow, I... uh... *blushes*", color: "text-pink-500" },
    scared: { icon: Skull, text: "Oh no, oh no, oh no!", color: "text-yellow-400" }
  }
};

export default function CharacterReactions({ character, lastMessage, affectionChange }: CharacterReactionsProps) {
  const [currentReaction, setCurrentReaction] = useState<any>(null);

  useEffect(() => {
    if (!lastMessage || !character) return;

    const message = lastMessage.toLowerCase();
    const characterType = character.name.toLowerCase().includes('rick') ? 'rick' : 'morty';
    const characterReactions = reactions[characterType as keyof typeof reactions];

    let reaction = null;

    // Check for specific triggers
    if (reactionTriggers.flirty.some(word => message.includes(word))) {
      reaction = characterReactions.flirty;
    } else if (reactionTriggers.positive.some(word => message.includes(word))) {
      reaction = characterReactions.positive;
    } else if (reactionTriggers.negative.some(word => message.includes(word))) {
      reaction = characterReactions.negative;
    } else if (characterType === 'rick' && reactionTriggers.rick_specific.some(word => message.includes(word))) {
      reaction = (characterReactions as any).science;
    } else if (characterType === 'morty' && reactionTriggers.morty_specific.some(word => message.includes(word))) {
      reaction = (characterReactions as any).scared;
    }

    // Affection-based reactions
    if (affectionChange && Math.abs(affectionChange) > 2) {
      if (affectionChange > 0) {
        reaction = characterReactions.positive;
      } else {
        reaction = characterReactions.negative;
      }
    }

    if (reaction) {
      setCurrentReaction(reaction);
      setTimeout(() => setCurrentReaction(null), 3000);
    }
  }, [lastMessage, affectionChange, character]);

  if (!currentReaction) return null;

  const IconComponent = currentReaction.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0, rotate: 180 }}
        className="fixed top-20 right-8 z-40"
      >
        <div className="bg-black/80 backdrop-blur-md rounded-full p-3 border border-primary/30">
          <div className="flex items-center space-x-2">
            <IconComponent className={`w-6 h-6 ${currentReaction.color}`} />
            <span className="text-sm text-white font-medium whitespace-nowrap">
              {currentReaction.text}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}