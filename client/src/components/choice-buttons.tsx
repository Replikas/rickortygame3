import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart, Zap, Shield, Brain, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChoiceButtonsProps {
  character: any;
  onChoiceSelect: (choice: any) => void;
  disabled?: boolean;
  conversationHistory?: any[];
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

export default function ChoiceButtons({ character, onChoiceSelect, disabled = false, conversationHistory = [] }: ChoiceButtonsProps) {
  const [choices, setChoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate new choices when character or conversation changes
  useEffect(() => {
    if (!character) return;
    
    generateChoices();
  }, [character?.id, conversationHistory.length]);

  const generateChoices = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/generate-choices", {
        characterId: character.id,
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.speaker === 'character' ? 'assistant' : 'user',
          content: msg.message,
          speaker: msg.speaker
        }))
      });
      
      const data = await response.json();
      setChoices(data.choices || getFallbackChoices());
    } catch (error) {
      console.error('Failed to generate choices:', error);
      setChoices(getFallbackChoices());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackChoices = () => {
    return [
      { type: "flirt", text: "You're quite interesting...", affectionPotential: 1 },
      { type: "challenge", text: "I think you're wrong about that.", affectionPotential: -1 },
      { type: "support", text: "That sounds really difficult.", affectionPotential: 2 },
      { type: "curious", text: "Can you tell me more?", affectionPotential: 1 }
    ];
  };

  if (!character) return null;

  const displayChoices = choices.length > 0 ? choices : getFallbackChoices();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
      {isLoading && (
        <div className="col-span-full flex items-center justify-center py-4">
          <RefreshCw className="w-5 h-5 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Generating new responses...</span>
        </div>
      )}
      
      {displayChoices.map((choice, index) => {
        const choiceType = choiceTypes[choice.type as keyof typeof choiceTypes] || choiceTypes.curious;
        const IconComponent = choiceType.icon;

        return (
          <motion.div
            key={`${choice.type}-${index}-${conversationHistory.length}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              disabled={disabled || isLoading}
              onClick={() => onChoiceSelect(choice)}
              className={cn(
                "w-full h-auto p-4 text-left justify-start border-2 transition-all duration-200",
                "min-h-[80px] max-w-full overflow-hidden",
                choiceType.borderColor,
                choiceType.hoverColor,
                "bg-card/50 backdrop-blur-sm",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title={choiceType.description}
            >
              <div className="flex items-start w-full">
                <IconComponent 
                  className={cn("w-5 h-5 mr-3 mt-0.5 flex-shrink-0", choiceType.color)} 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight mb-1 break-words whitespace-normal">
                    {choice.text}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground capitalize">
                      {choice.type}
                    </span>
                  </div>
                </div>
              </div>
            </Button>
          </motion.div>
        );
      })}
      
      {!isLoading && choices.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-full"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={generateChoices}
            disabled={disabled}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Generate new responses
          </Button>
        </motion.div>
      )}
    </div>
  );
}