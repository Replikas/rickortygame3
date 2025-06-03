import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import CharacterSelection from "@/components/character-selection";
import GameScreen from "@/components/game-screen";
import SettingsModal from "@/components/settings-modal";
import { useGameContext } from "@/context/game-context";
import { Button } from "@/components/ui/button";
import { Settings, Heart, User } from "lucide-react";

export default function Home() {
  const { 
    selectedCharacter, 
    currentUser, 
    showSettings, 
    setShowSettings,
    gameState 
  } = useGameContext();
  
  const [showCharacterSelection, setShowCharacterSelection] = useState(true);

  // Portal background particles
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Create background particles
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3000,
    }));
    setParticles(newParticles);
  }, []);

  // Always show character selection initially, only switch to chat when character is selected
  useEffect(() => {
    if (selectedCharacter && showCharacterSelection) {
      setShowCharacterSelection(false);
    }
  }, [selectedCharacter, showCharacterSelection]);

  const handleCharacterSelect = () => {
    setShowCharacterSelection(false);
  };

  const handleBackToSelection = () => {
    setShowCharacterSelection(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Portal Background Animation */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {/* Starfield background effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-muted to-background opacity-60"></div>
        
        {/* Animated portal particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary rounded-full animate-particle-float"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}ms`,
            }}
          />
        ))}
        
        {/* Portal rings */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-primary/30 animate-portal-pulse" />
        <div 
          className="absolute bottom-40 right-32 w-24 h-24 rounded-full border-2 border-primary/20 animate-portal-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div 
          className="absolute top-1/2 left-1/3 w-16 h-16 rounded-full border-2 border-primary/40 animate-portal-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 glass-morphism border-b border-border/20 p-4 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full animate-portal-pulse flex items-center justify-center">
              <div className="w-6 h-6 bg-primary-foreground rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-glow animate-glow">
              Rick & Morty Dating Simulator
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* User Profile & Relationship Status */}
            <div className="hidden md:flex items-center space-x-3 glass-morphism/50 rounded-lg px-4 py-2 border border-border/30">
              {currentUser ? (
                <>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      {currentUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-secondary-foreground">{currentUser.username}</span>
                </>
              ) : (
                <>
                  <User className="w-6 h-6 text-primary" />
                  <span className="text-secondary-foreground">Guest</span>
                </>
              )}
            </div>

            {/* Relationship Level */}
            {gameState && (
              <div className="hidden md:flex items-center space-x-2 text-sm">
                <Heart className="w-4 h-4 text-red-400" />
                <span>Level {Math.floor((gameState.affectionLevel || 0) / 20) + 1}</span>
              </div>
            )}
            
            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="glass-morphism/50 border border-border/30 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              <Settings className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {showCharacterSelection ? (
          <CharacterSelection onCharacterSelect={handleCharacterSelect} />
        ) : (
          <GameScreen onBackToSelection={handleBackToSelection} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden glass-morphism border-t border-border/20 px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCharacterSelection(true)}
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg hover:bg-primary/10 transition-all duration-300 mobile-touch-target"
          >
            <User className="w-5 h-5 text-primary" />
            <span className="text-xs">Characters</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg hover:bg-primary/10 transition-all duration-300 mobile-touch-target"
            disabled={!selectedCharacter}
          >
            <div className="w-5 h-5 flex items-center justify-center">💬</div>
            <span className="text-xs">Chat</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg hover:bg-primary/10 transition-all duration-300 mobile-touch-target"
            disabled={!gameState}
          >
            <Heart className="w-5 h-5 text-red-400" />
            <span className="text-xs">
              {gameState ? `Lv.${Math.floor((gameState.affectionLevel || 0) / 20) + 1}` : 'Relationship'}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center space-y-1 py-2 px-3 rounded-lg hover:bg-primary/10 transition-all duration-300 mobile-touch-target"
          >
            <Settings className="w-5 h-5 text-primary" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
