import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Zap, Shield, Brain } from "lucide-react";

interface ChoiceButtonsProps {
  character: any;
  onChoiceSelect: (choice: any) => void;
  disabled?: boolean;
}

const choiceTypes = {
  flirt: {
    icon: Heart,
    color: "text-red-400",
    borderColor: "border-red-400/50",
    hoverColor: "hover:border-red-400 hover:bg-red-400/10",
    description: "Romantic response"
  },
  challenge: {
    icon: Zap,
    color: "text-orange-400",
    borderColor: "border-orange-400/50",
    hoverColor: "hover:border-orange-400 hover:bg-orange-400/10",
    description: "Challenge or provoke"
  },
  support: {
    icon: Shield,
    color: "text-blue-400",
    borderColor: "border-blue-400/50",
    hoverColor: "hover:border-blue-400 hover:bg-blue-400/10",
    description: "Supportive response"
  },
  curious: {
    icon: Brain,
    color: "text-primary",
    borderColor: "border-primary/50",
    hoverColor: "hover:border-primary hover:bg-primary/10",
    description: "Ask questions"
  }
};

// Character-specific choice sets
const characterChoices: { [key: string]: any[] } = {
  "Rick Sanchez (C-137)": [
    {
      type: "curious",
      text: "Tell me about your worst interdimensional adventure",
      affectionPotential: 2,
    },
    {
      type: "challenge",
      text: "I bet I could understand your science better than you think",
      affectionPotential: 1,
    },
    {
      type: "support",
      text: "Your intelligence is really impressive, Rick",
      affectionPotential: 3,
    },
    {
      type: "flirt",
      text: "Is it hot in here, or is it just your portal gun?",
      affectionPotential: 2,
    }
  ],
  "Morty Smith": [
    {
      type: "support",
      text: "You're braver than you think, Morty",
      affectionPotential: 3,
    },
    {
      type: "curious",
      text: "What's the scariest thing Rick has made you do?",
      affectionPotential: 2,
    },
    {
      type: "flirt",
      text: "Your kindness is really attractive",
      affectionPotential: 2,
    },
    {
      type: "challenge",
      text: "Maybe you should stand up to Rick more often",
      affectionPotential: 1,
    }
  ],
  "Evil Morty": [
    {
      type: "curious",
      text: "What's your plan for escaping the Central Finite Curve?",
      affectionPotential: 2,
    },
    {
      type: "challenge",
      text: "You're just another Morty pretending to be special",
      affectionPotential: -1,
    },
    {
      type: "support",
      text: "Your strategic mind is fascinating",
      affectionPotential: 3,
    },
    {
      type: "flirt",
      text: "Intelligence and ambition are incredibly attractive",
      affectionPotential: 2,
    }
  ],
  "Rick Prime": [
    {
      type: "challenge",
      text: "You're not as superior as you think you are",
      affectionPotential: 0,
    },
    {
      type: "curious",
      text: "What makes you different from other Ricks?",
      affectionPotential: 1,
    },
    {
      type: "support",
      text: "Your efficiency is remarkable",
      affectionPotential: 1,
    },
    {
      type: "flirt",
      text: "Power and ruthlessness can be... intriguing",
      affectionPotential: 2,
    }
  ]
};

export default function ChoiceButtons({ character, onChoiceSelect, disabled = false }: ChoiceButtonsProps) {
  const choices = characterChoices[character?.name] || characterChoices["Rick Sanchez (C-137)"];

  const handleChoiceClick = (choice: any) => {
    if (disabled) return;
    onChoiceSelect(choice);
  };

  return (
    <div className="space-y-3">
      {choices.map((choice, index) => {
        const choiceType = choiceTypes[choice.type as keyof typeof choiceTypes];
        const IconComponent = choiceType.icon;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
          >
            <Button
              onClick={() => handleChoiceClick(choice)}
              disabled={disabled}
              className={cn(
                "w-full text-left p-4 h-auto rounded-lg border-2 transition-all duration-300 group",
                "glass-morphism/30 hover:glass-morphism/50",
                choiceType.borderColor,
                choiceType.hoverColor,
                disabled && "opacity-50 cursor-not-allowed"
              )}
              variant="ghost"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-start space-x-3 flex-1">
                  <IconComponent 
                    className={cn(
                      "w-5 h-5 mt-0.5 transition-colors",
                      choiceType.color,
                      "group-hover:scale-110"
                    )} 
                  />
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm leading-relaxed transition-colors",
                      disabled ? "text-muted-foreground" : "text-foreground group-hover:" + choiceType.color
                    )}>
                      {choice.text}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {choiceType.description}
                      {choice.affectionPotential !== 0 && (
                        <span className={cn(
                          "ml-2",
                          choice.affectionPotential > 0 ? "text-green-400" : "text-red-400"
                        )}>
                          • {choice.affectionPotential > 0 ? "+" : ""}{choice.affectionPotential} affection
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Affection potential indicator */}
                <div className="flex flex-col items-center space-y-1">
                  {Array.from({ length: Math.abs(choice.affectionPotential) }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        choice.affectionPotential > 0 
                          ? "bg-green-400/60 group-hover:bg-green-400" 
                          : choice.affectionPotential < 0
                          ? "bg-red-400/60 group-hover:bg-red-400"
                          : "bg-gray-400/60"
                      )}
                    />
                  ))}
                </div>
              </div>
            </Button>
          </motion.div>
        );
      })}

      {/* Help Text */}
      <motion.div 
        className="text-center mt-6 text-xs text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>Choose your response carefully - different choices affect your relationship differently</p>
        <div className="flex justify-center space-x-4 mt-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Positive</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            <span>Neutral</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full" />
            <span>Risky</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
