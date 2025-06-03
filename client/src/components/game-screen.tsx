import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { useGameContext } from "@/context/game-context";
import CharacterSprite from "./character-sprite";
import DialogueBox from "./dialogue-box";
import ChoiceButtons from "./choice-buttons";
import AffectionMeter from "./affection-meter";
import EasterEggs from "./easter-eggs";
import RandomEvents from "./random-events";
import CharacterReactions from "./character-reactions";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { playUISound, playCharacterSound, audioManager, startBackgroundMusic } from "@/lib/audio";

interface GameScreenProps {
  onBackToSelection: () => void;
}

export default function GameScreen({ onBackToSelection }: GameScreenProps) {
  const { selectedCharacter, currentUser, gameState, setGameState, setSelectedCharacter, setShowSettings } = useGameContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [customMessage, setCustomMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");

  // Get or create game state
  const { data: currentGameState, isLoading: gameStateLoading } = useQuery({
    queryKey: [`/api/game-state/${currentUser?.id || 1}/${selectedCharacter?.id}`],
    enabled: !!selectedCharacter,
  });

  // Get dialogue history
  const { data: dialogues, isLoading: dialoguesLoading } = useQuery({
    queryKey: [`/api/dialogues/${currentGameState?.id}`],
    enabled: !!currentGameState?.id,
  });

  // Send AI conversation request
  const conversationMutation = useMutation({
    mutationFn: async (message: string) => {
      const apiKey = currentGameState?.settings?.openrouterApiKey;
      
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('OpenRouter API key is required. Please configure your API key in settings.');
      }

      const response = await apiRequest("POST", "/api/conversation", {
        characterId: selectedCharacter?.id,
        message,
        gameStateId: currentGameState?.id,
        apiKey: apiKey,
        aiModel: currentGameState?.settings?.aiModel || "deepseek/deepseek-chat-v3-0324:free",
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Add character response to dialogue
      addDialogueMutation.mutate({
        gameStateId: currentGameState?.id,
        speaker: "character",
        message: data.message,
        messageType: "character",
        affectionChange: data.affectionChange,
        emotionTriggered: data.emotion,
      });

      // Update game state with new emotion and affection
      if (currentGameState) {
        updateGameStateMutation.mutate({
          currentEmotion: data.emotion,
          affectionLevel: Math.round((currentGameState.affectionLevel || 0) + (data.affectionChange || 0)),
          conversationCount: (currentGameState.conversationCount || 0) + 1,
        });
      }

      setIsTyping(false);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Failed to send message. Please try again.";
      toast({
        title: "Conversation Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsTyping(false);
    },
  });

  // Add dialogue mutation
  const addDialogueMutation = useMutation({
    mutationFn: async (dialogue: any) => {
      const response = await apiRequest("POST", "/api/dialogues", dialogue);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/dialogues/${currentGameState?.id}`] });
      // Also refetch dialogues immediately
      queryClient.refetchQueries({ queryKey: [`/api/dialogues/${currentGameState?.id}`] });
    },
  });

  // Update game state mutation
  const updateGameStateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PUT", `/api/game-state/${currentGameState?.id}`, updates);
      return response.json();
    },
    onSuccess: (updatedState) => {
      setGameState(updatedState);
      queryClient.invalidateQueries({ queryKey: ["/api/game-state", currentUser?.id || 1, selectedCharacter?.id] });
    },
  });

  // Update local game state when data loads
  useEffect(() => {
    if (currentGameState) {
      setGameState(currentGameState);
    }
  }, [currentGameState, setGameState]);

  // Initialize audio system on component mount
  useEffect(() => {
    if (selectedCharacter && currentGameState) {
      audioManager.resumeAudioContext();
      
      // Set audio volumes from game settings
      if (currentGameState.settings) {
        audioManager.setVolumes(
          currentGameState.settings.masterVolume,
          currentGameState.settings.sfxVolume,
          currentGameState.settings.musicVolume
        );
      }
    }
  }, [selectedCharacter, currentGameState]);

  // Track dialogue length to detect new messages
  const [previousDialogueLength, setPreviousDialogueLength] = useState(0);

  // Play character sound only when NEW AI response is received
  useEffect(() => {
    if (dialogues && dialogues.length > previousDialogueLength) {
      const lastDialogue = dialogues[dialogues.length - 1];
      if (lastDialogue?.speaker === 'character' && selectedCharacter) {
        const emotion = currentGameState?.currentEmotion || 'neutral';
        playCharacterSound(selectedCharacter.name, emotion);
      }
      setPreviousDialogueLength(dialogues.length);
    }
  }, [dialogues, selectedCharacter, currentGameState?.currentEmotion, previousDialogueLength]);

  const handleChoiceSelect = async (choice: any) => {
    if (!currentGameState) return;

    // Play UI sound for selection
    playUISound('select');

    // Add player message to dialogue
    addDialogueMutation.mutate({
      gameStateId: currentGameState.id,
      speaker: "player",
      message: choice.text,
      messageType: "choice",
      affectionChange: 0,
    });

    // Trigger AI response
    setIsTyping(true);
    conversationMutation.mutate(choice.text);
  };

  const handleCustomMessage = async () => {
    if (!customMessage.trim() || !currentGameState) return;

    const message = customMessage.trim();
    setCustomMessage("");

    // Add player message to dialogue
    addDialogueMutation.mutate({
      gameStateId: currentGameState.id,
      speaker: "player",
      message,
      messageType: "custom",
      affectionChange: 0,
    });

    // Trigger AI response
    setIsTyping(true);
    conversationMutation.mutate(message);
  };

  if (!selectedCharacter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No character selected</p>
          <Button onClick={onBackToSelection}>Select Character</Button>
        </div>
      </div>
    );
  }

  if (gameStateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-primary animate-glow">Initializing interdimensional connection...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.section 
      className="py-4 px-2 sm:py-8 sm:px-4 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto h-full">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 h-full min-h-[calc(100vh-2rem)]">
          
          {/* Character Panel - Mobile: Top, Desktop: Left */}
          <motion.div 
            className="lg:col-span-1 order-1 lg:order-1 space-y-4 sm:space-y-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedCharacter(null);
                setGameState(null);
                onBackToSelection();
              }}
              className="mb-2 sm:mb-4 text-muted-foreground hover:text-primary transition-colors min-h-[44px] w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Change Character
            </Button>

            {/* API Key Warning */}
            {(!currentGameState?.settings?.openrouterApiKey || currentGameState.settings.openrouterApiKey.trim() === '') && (
              <motion.div
                className="glass-morphism border border-yellow-400/30 rounded-xl p-4 backdrop-blur-sm mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-yellow-400 text-sm font-medium">AI Conversations Disabled</p>
                    <p className="text-muted-foreground text-xs">
                      Configure your OpenRouter API key in settings to enable AI-powered character responses
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSettings(true)}
                    className="text-xs border-yellow-400/30 hover:border-yellow-400/50 hover:bg-yellow-400/10"
                  >
                    Settings
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Character Display */}
            <Card className="glass-morphism portal-glow">
              <CardContent className="p-6">
                <div className="text-center">
                  {/* Character Sprite with Emotion */}
                  <div className="mb-4">
                    <CharacterSprite 
                      character={selectedCharacter}
                      emotion={currentGameState?.currentEmotion || "neutral"}
                      size="extra-large"
                      className="mx-auto animate-float"
                      lastMessage={dialogues && dialogues.length > 0 ? dialogues[dialogues.length - 1]?.message || "" : ""}
                      emotionalIntensity={5}
                    />
                  </div>
                  
                  <h3 className="text-lg font-bold text-glow mb-2">
                    {selectedCharacter.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current Emotion: 
                    <span className="text-secondary-foreground ml-1 capitalize">
                      {currentGameState?.currentEmotion || "neutral"}
                    </span>
                  </p>
                  
                  {/* Affection Meter */}
                  <AffectionMeter 
                    level={currentGameState?.affectionLevel || 0}
                    status={currentGameState?.relationshipStatus || "stranger"}
                  />

                  {/* Character Stats */}
                  <div className="mt-6 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Conversations:</span>
                      <span className="text-primary">
                        {currentGameState?.conversationCount || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Relationship:</span>
                      <span className="text-secondary-foreground capitalize">
                        {currentGameState?.relationshipStatus || "stranger"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dialogue and Interaction Area - Mobile: Bottom, Desktop: Right */}
          <motion.div 
            className="lg:col-span-2 order-2 lg:order-2 space-y-4 sm:space-y-6 flex-1 flex flex-col"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            
            {/* Dialogue History */}
            <Card className="glass-morphism portal-glow flex-1 flex flex-col">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="flex items-center justify-between text-glow text-base sm:text-lg">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-secondary-foreground" />
                    Interdimensional Chat
                  </div>
                  {/* NSFW Toggle */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium transition-colors ${
                      currentGameState?.settings?.nsfwContent ? 'text-muted-foreground' : 'text-green-400'
                    }`}>
                      SFW
                    </span>
                    <Switch
                      checked={currentGameState?.settings?.nsfwContent || false}
                      onCheckedChange={async (checked) => {
                        if (!currentGameState?.id) return;
                        
                        try {
                          const response = await apiRequest("PUT", `/api/game-state/${currentGameState.id}`, {
                            settings: {
                              ...currentGameState.settings,
                              nsfwContent: checked
                            }
                          });
                          const updatedState = await response.json();
                          setGameState(updatedState);
                          queryClient.invalidateQueries({ queryKey: [`/api/game-state/${currentUser?.id || 1}/${selectedCharacter?.id}`] });
                          
                          toast({
                            title: `${checked ? 'NSFW' : 'SFW'} Mode Enabled`,
                            description: `Mature content is now ${checked ? 'allowed' : 'restricted'} in conversations`,
                          });
                        } catch (error) {
                          toast({
                            title: "Settings Error",
                            description: "Failed to update content filter setting",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-green-500"
                    />
                    <span className={`text-xs font-medium transition-colors ${
                      currentGameState?.settings?.nsfwContent ? 'text-red-400' : 'text-muted-foreground'
                    }`}>
                      NSFW
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <DialogueBox 
                  dialogues={dialogues || []}
                  character={selectedCharacter}
                  isLoading={dialoguesLoading}
                  isTyping={isTyping}
                />
              </CardContent>
            </Card>

            {/* Choice Buttons */}
            <Card className="glass-morphism portal-glow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-glow">
                  Response Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChoiceButtons 
                  character={selectedCharacter}
                  onChoiceSelect={handleChoiceSelect}
                  disabled={isTyping || conversationMutation.isPending}
                  conversationHistory={dialogues || []}
                />
              </CardContent>
            </Card>

            {/* Custom Message Input */}
            <Card className="glass-morphism portal-glow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-glow">
                  Custom Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-4 h-4 flex items-center justify-center">⌨️</div>
                    <span>Or type your own response:</span>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleCustomMessage();
                        }
                      }}
                      className="w-full glass-morphism border-2 border-border/30 rounded-lg p-4 text-foreground placeholder-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all duration-300 resize-none"
                      rows={3}
                      placeholder="Type your custom response here..."
                      maxLength={200}
                      disabled={isTyping || conversationMutation.isPending}
                    />
                    
                    <div className="absolute bottom-3 right-3 flex items-center space-x-3">
                      <span className="text-xs text-muted-foreground">
                        {customMessage.length}/200
                      </span>
                      <Button
                        onClick={handleCustomMessage}
                        disabled={!customMessage.trim() || isTyping || conversationMutation.isPending}
                        className="btn-portal mobile-touch-target"
                        size="sm"
                      >
                        <div className="flex items-center space-x-2">
                          <span>Send</span>
                          <div className="w-4 h-4 flex items-center justify-center">📤</div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Easter Eggs */}
        <EasterEggs trigger={lastUserMessage} character={selectedCharacter} />

        {/* Character Reactions */}
        <CharacterReactions 
          character={selectedCharacter} 
          lastMessage={lastUserMessage}
          affectionChange={0} // This could be tracked from dialogue responses
        />

        {/* Random Events */}
        <RandomEvents 
          character={selectedCharacter} 
          conversationHistory={dialogues || []}
          lastMessage={lastUserMessage}
          onEventComplete={(affectionChange) => {
            // Update affection level when random event completes
            if (currentGameState) {
              const newAffection = Math.max(0, Math.min(100, (currentGameState.affectionLevel || 0) + affectionChange));
              // Update the game state with new affection
              queryClient.setQueryData([`/api/game-state/${currentUser?.id || 1}/${selectedCharacter?.id}`], {
                ...currentGameState,
                affectionLevel: newAffection
              });
              
              toast({
                title: affectionChange > 0 ? "Affection Increased!" : "Affection Decreased!",
                description: `${affectionChange > 0 ? '+' : ''}${affectionChange} affection points`,
                variant: affectionChange > 0 ? "default" : "destructive",
              });
            }
          }}
        />
      </div>
    </motion.section>
  );
}
