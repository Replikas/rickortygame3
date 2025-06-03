import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useGameContext } from "@/context/game-context";
import CharacterSprite from "./character-sprite";
import { characterConfig } from "@/lib/characters";

interface CharacterSelectionProps {
  onCharacterSelect: () => void;
}

export default function CharacterSelection({ onCharacterSelect }: CharacterSelectionProps) {
  const { setSelectedCharacter, currentUser } = useGameContext();

  const { data: characters, isLoading } = useQuery({
    queryKey: ["/api/characters"],
    enabled: true,
  });

  const handleCharacterSelect = async (character: any) => {
    console.log('Selecting character:', character.name);
    setSelectedCharacter(character);
    onCharacterSelect();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary animate-glow">Loading interdimensional characters...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 px-4 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-6xl font-bold text-glow mb-4 animate-glow heading-responsive">
            Choose Your Dimension
          </h2>
          <p className="text-secondary-foreground text-lg md:text-xl text-responsive">
            Select your interdimensional companion for this wild adventure
          </p>
        </motion.div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {characters?.map((character: any, index: number) => {
            const config = characterConfig[character.name] || characterConfig.default;
            
            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className={`glass-morphism rounded-2xl p-6 cursor-pointer portal-glow hover:portal-glow-strong transition-all duration-300 ${config.hoverClass}`}>
                  <CardContent className="p-0">
                    <div className="text-center">
                      {/* Character Sprite */}
                      <div className="mb-4">
                        <CharacterSprite 
                          character={character}
                          size="large"
                          className="mx-auto animate-float"
                          style={{ animationDelay: `${index * 0.5}s` }}
                        />
                      </div>

                      {/* Character Info */}
                      <h3 className="text-xl font-bold mb-2 text-glow">
                        {character.name}
                      </h3>
                      <p className="text-secondary-foreground text-sm mb-4 text-responsive">
                        {character.description}
                      </p>

                      {/* Character Stats */}
                      <div className="space-y-2 text-xs mb-6">
                        {config.stats.map((stat, statIndex) => (
                          <div key={statIndex} className="flex justify-between items-center">
                            <span className="text-muted-foreground">{stat.name}:</span>
                            <div className="flex space-x-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < stat.value 
                                      ? stat.color || 'bg-primary' 
                                      : 'bg-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Character Traits */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {character.traits?.slice(0, 3).map((trait: string, traitIndex: number) => (
                            <span
                              key={traitIndex}
                              className="px-2 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground border border-border/30"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Select Button */}
                      <Button
                        onClick={() => handleCharacterSelect(character)}
                        className={`w-full mobile-touch-target btn-portal ${config.buttonClass}`}
                        style={{ 
                          background: config.gradient,
                          color: config.textColor 
                        }}
                      >
                        Choose {character.name.split(' ')[0]}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Info */}
        <motion.div 
          className="text-center mt-12 text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p>Each character has unique personality traits and dialogue patterns</p>
          <p className="mt-2">Your choices will affect your relationship progression</p>
        </motion.div>
      </div>
    </section>
  );
}
