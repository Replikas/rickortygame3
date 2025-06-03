import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useGameContext } from "@/context/game-context";
import CharacterSprite from "./character-sprite";

// Import character images
import rickImage from "@assets/rick.jpg";
import mortyImage from "@assets/morty.jpg";
import evilMortyImage from "@assets/evil-morty.png";
import rickPrimeImage from "@assets/RICKPRIME.webp";

interface CharacterSelectionProps {
  onCharacterSelect: () => void;
}

export default function CharacterSelection({ onCharacterSelect }: CharacterSelectionProps) {
  const { setSelectedCharacter } = useGameContext();

  const { data: characters, isLoading } = useQuery({
    queryKey: ["/api/characters"],
    enabled: true,
  });

  const characterImages = {
    "Rick Sanchez (C-137)": rickImage,
    "Morty Smith": mortyImage,
    "Evil Morty": evilMortyImage,
    "Rick Prime": rickPrimeImage,
  };

  const handleCharacterSelect = async (character: any) => {
    console.log('Selecting character:', character.name);
    setSelectedCharacter(character);
    onCharacterSelect();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto portal-glow" />
            <div className="absolute inset-0 w-20 h-20 border-2 border-primary/30 rounded-full animate-ping mx-auto" />
          </div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-primary text-xl font-medium shimmer-effect bg-clip-text"
          >
            Loading interdimensional characters...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-green-400 mb-4">
            Choose Your Adventure
          </h1>
          <p className="text-gray-300 text-lg">
            Select your interdimensional companion
          </p>
        </motion.div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {characters?.map((character: any, index: number) => {
            const characterImage = characterImages[character.name as keyof typeof characterImages];
            
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
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCharacterSelect(character)}
                className="cursor-pointer"
              >
                <Card className="relative border border-border/30 rounded-xl overflow-hidden backdrop-blur-xl bg-card/40 hover:bg-card/60 hover:border-primary/50 transition-all duration-500 h-full group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex flex-col h-full z-10">
                    {/* Character Image */}
                    <div className="h-48 bg-gradient-to-b from-transparent via-transparent to-background/60 relative overflow-hidden">
                      {characterImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={characterImage}
                            alt={character.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            style={{
                              objectPosition: character.name === "Rick Prime" ? "center 15%" : 
                                            character.name === "Evil Morty" ? "center 25%" :
                                            character.name === "Rick Sanchez (C-137)" ? "center 20%" :
                                            "center 30%"
                            }}
                          />
                          {/* Dark transparent overlay */}
                          <div className="absolute inset-0 bg-black/20 mix-blend-multiply"></div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground flex items-center justify-center">
                          <CharacterSprite character={character} size="large" />
                        </div>
                      )}
                      
                      {/* Difficulty Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-green-400 text-black text-xs font-bold rounded">
                          {index < 2 ? "Beginner" : "Expert"}
                        </span>
                      </div>
                    </div>

                    {/* Character Info */}
                    <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-primary mb-1">
                          {character.name}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-tight line-clamp-3">
                          {character.description}
                        </p>
                      </div>

                      {/* Personality Section */}
                      <div>
                        <h4 className="text-primary text-xs font-semibold mb-2">Personality</h4>
                        <div className="flex flex-wrap gap-1">
                          {character.traits?.slice(0, 3).map((trait: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded capitalize"
                            >
                              {trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tips Section */}
        <motion.div
          className="glass-morphism border border-border/30 rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-primary text-lg font-bold mb-3 text-center">
            Interdimensional Dating Tips
          </h3>
          <p className="text-muted-foreground text-sm text-center mb-4">
            Each character has unique personality traits and conversation styles. Choose wisely - your adventure depends on it!
          </p>
          <div className="flex justify-center space-x-6 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Beginner Friendly</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              <span>Challenging</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
              <span>Expert Level</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}