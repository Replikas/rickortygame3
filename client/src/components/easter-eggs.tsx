import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles, Skull, Flame } from "lucide-react";

interface EasterEggProps {
  trigger: string;
  character: any;
}

const easterEggs = {
  "wubba lubba dub dub": {
    text: "I am in great pain, please help me",
    icon: Skull,
    color: "text-red-400",
    effect: "pain"
  },
  "get schwifty": {
    text: "*Portal opens to show Rick dancing*",
    icon: Zap,
    color: "text-green-400", 
    effect: "dance"
  },
  "pickle rick": {
    text: "I TURNED MYSELF INTO A PICKLE! PICKLE RIIIICK!",
    icon: Sparkles,
    color: "text-yellow-400",
    effect: "pickle"
  },
  "show me what you got": {
    text: "*Giant floating head appears*",
    icon: Flame,
    color: "text-orange-400",
    effect: "head"
  }
};

export default function EasterEggs({ trigger, character }: EasterEggProps) {
  const [activeEgg, setActiveEgg] = useState<any>(null);

  useEffect(() => {
    const lowerTrigger = trigger.toLowerCase();
    const egg = easterEggs[lowerTrigger as keyof typeof easterEggs];
    
    if (egg) {
      setActiveEgg(egg);
      setTimeout(() => setActiveEgg(null), 3000);
    }
  }, [trigger]);

  if (!activeEgg) return null;

  const IconComponent = activeEgg.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0, y: -50 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
      >
        <div className="bg-black/80 backdrop-blur-md rounded-lg p-6 border border-primary/50 max-w-md">
          <div className="flex items-center space-x-3">
            <IconComponent className={`w-8 h-8 ${activeEgg.color}`} />
            <p className="text-lg font-medium text-white">{activeEgg.text}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}