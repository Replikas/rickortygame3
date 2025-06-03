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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-green-400 text-lg">Loading interdimensional characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
                <Card className="bg-gray-800/80 border border-gray-600/50 rounded-xl overflow-hidden backdrop-blur-sm hover:bg-gray-700/80 hover:border-green-400/50 transition-all duration-300">
                  <div className="relative">
                    {/* Character Image */}
                    <div className="h-48 bg-gradient-to-b from-transparent to-gray-900/80 relative overflow-hidden flex items-center justify-center">
                      {characterImage ? (
                        <img 
                          src={characterImage}
                          alt={character.name}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: "center 30%",
                            transform: "scale(1.2)"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
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
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-green-400 mb-1">
                          {character.name}
                        </h3>
                        <p className="text-gray-300 text-sm leading-tight">
                          {character.description}
                        </p>
                      </div>

                      {/* Personality Section */}
                      <div>
                        <h4 className="text-green-400 text-xs font-semibold mb-2">Personality</h4>
                        <div className="flex flex-wrap gap-1">
                          {character.traits?.slice(0, 3).map((trait: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded capitalize"
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
          className="bg-gray-800/50 border border-gray-600/30 rounded-xl p-6 backdrop-blur-sm"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3 className="text-green-400 text-lg font-bold mb-3 text-center">
            Interdimensional Dating Tips
          </h3>
          <p className="text-gray-300 text-sm text-center mb-4">
            Each character has unique personality traits and conversation styles. Choose wisely - your adventure depends on it!
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
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