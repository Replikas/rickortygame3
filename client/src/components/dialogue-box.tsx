import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import CharacterSprite from "./character-sprite";
import { User } from "lucide-react";

interface DialogueBoxProps {
  dialogues: any[];
  character: any;
  isLoading?: boolean;
  isTyping?: boolean;
}

export default function DialogueBox({ 
  dialogues, 
  character, 
  isLoading = false, 
  isTyping = false 
}: DialogueBoxProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState<{ [key: number]: string }>({});

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [dialogues, isTyping]);

  // Typewriter effect for character messages
  useEffect(() => {
    const characterMessages = dialogues.filter(d => d.speaker === "character");
    const latestMessage = characterMessages[characterMessages.length - 1];
    
    if (latestMessage && !displayedText[latestMessage.id]) {
      const text = latestMessage.message;
      let currentText = "";
      let index = 0;

      const timer = setInterval(() => {
        if (index < text.length) {
          currentText += text[index];
          setDisplayedText(prev => ({
            ...prev,
            [latestMessage.id]: currentText
          }));
          index++;
        } else {
          clearInterval(timer);
        }
      }, 30);

      return () => clearInterval(timer);
    }
  }, [dialogues, displayedText]);

  if (isLoading) {
    return (
      <div className="h-64 lg:h-80 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative">
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto portal-glow" />
            <div className="absolute inset-0 w-12 h-12 border border-primary/30 rounded-full animate-ping mx-auto" />
          </div>
          <p className="text-sm text-primary font-medium shimmer-effect">Loading conversation history...</p>
        </motion.div>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <ScrollArea 
        ref={scrollAreaRef}
        className="h-64 lg:h-80 pr-4"
      >
        <div className="space-y-4">
          {dialogues.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 text-muted-foreground"
            >
              <p>Start a conversation to begin your interdimensional adventure!</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {dialogues.map((dialogue, index) => {
                const isCharacter = dialogue.speaker === "character";
                const messageText = isCharacter && displayedText[dialogue.id] 
                  ? displayedText[dialogue.id] 
                  : dialogue.message;

                return (
                  <motion.div
                    key={dialogue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      "flex items-start space-x-3",
                      !isCharacter && "flex-row-reverse space-x-reverse"
                    )}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {isCharacter ? (
                        <CharacterSprite 
                          character={character}
                          size="small"
                          className="border-2 border-primary/20 portal-pulse"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center portal-pulse">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={cn(
                      "flex-1 max-w-[75%]",
                      !isCharacter && "text-right"
                    )}>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          "relative rounded-xl p-4 backdrop-blur-xl border transition-all duration-500 group hover:scale-[1.02]",
                          isCharacter 
                            ? "bg-card/60 border-primary/30 hover:border-primary/50 hover:bg-card/80" 
                            : "bg-blue-500/20 border-blue-400/30 hover:border-blue-400/50 hover:bg-blue-500/30"
                        )}
                      >
                        <p className={cn(
                          "text-sm leading-relaxed",
                          isCharacter ? "text-foreground" : "text-blue-300"
                        )}>
                          {messageText}
                          {isCharacter && displayedText[dialogue.id] && 
                           displayedText[dialogue.id].length < dialogue.message.length && (
                            <motion.span
                              className="inline-block w-2 h-4 bg-primary ml-1"
                              animate={{ opacity: [1, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            />
                          )}
                        </p>

                        {/* Affection change indicator */}
                        {dialogue.affectionChange !== 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={cn(
                              "text-xs mt-2 flex items-center space-x-1",
                              dialogue.affectionChange > 0 ? "text-green-400" : "text-red-400"
                            )}
                          >
                            <span>{dialogue.affectionChange > 0 ? "+" : ""}{dialogue.affectionChange}</span>
                            <span>❤️</span>
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Timestamp and sender */}
                      <div className={cn(
                        "text-xs text-muted-foreground mt-1 flex items-center space-x-2",
                        !isCharacter && "justify-end"
                      )}>
                        <span>{isCharacter ? character.name.split(' ')[0] : "You"}</span>
                        <span>•</span>
                        <span>{formatTimestamp(dialogue.timestamp)}</span>
                        {dialogue.messageType && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{dialogue.messageType}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start space-x-3"
              >
                <CharacterSprite 
                  character={character}
                  size="small"
                  className="border-2 border-primary/20 portal-pulse"
                />
                <div className="glass-morphism rounded-lg p-3 border border-primary/20">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-sm">{character.name.split(' ')[0]} is typing...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}