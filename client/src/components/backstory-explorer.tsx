import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Book, Lock, Unlock, Play, Calendar, Heart } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CharacterSprite from "./character-sprite";

interface BackstoryExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  character: any;
  gameState?: any;
  onBackstoryUnlock?: (backstoryId: string) => void;
}

const backstoryDefinitions = {
  "Rick Sanchez (C-137)": [
    {
      id: "diane_tragedy",
      title: "The Day Everything Changed",
      description: "Rick Prime's attack on his family",
      requiredAffection: 60,
      category: "tragedy"
    },
    {
      id: "invention_portal",
      title: "First Portal Gun",
      description: "The discovery that opened infinite realities",
      requiredAffection: 30,
      category: "science"
    },
    {
      id: "abandoning_beth",
      title: "Walking Away",
      description: "Why he left his daughter behind",
      requiredAffection: 70,
      category: "family"
    },
    {
      id: "bird_person",
      title: "War and Friendship",
      description: "The bond forged in battle",
      requiredAffection: 40,
      category: "friendship"
    },
    {
      id: "unity",
      title: "Love and Loss",
      description: "The relationship that almost ended everything",
      requiredAffection: 80,
      category: "love"
    }
  ],
  "Morty Smith": [
    {
      id: "cronenberg_world",
      title: "Burying Yourself",
      description: "The day reality became meaningless",
      requiredAffection: 50,
      category: "trauma"
    },
    {
      id: "purge_planet",
      title: "The Monster Within",
      description: "When Morty discovered his dark side",
      requiredAffection: 60,
      category: "violence"
    },
    {
      id: "evil_morty_trauma",
      title: "The Morty Revelation",
      description: "Learning the truth about Rick and Mortys",
      requiredAffection: 70,
      category: "revelation"
    },
    {
      id: "jessica_crush",
      title: "Normal Feelings",
      description: "Love in an abnormal world",
      requiredAffection: 25,
      category: "love"
    },
    {
      id: "family_dysfunction",
      title: "Caught in the Middle",
      description: "Balancing family chaos and adventures",
      requiredAffection: 35,
      category: "family"
    }
  ],
  "Evil Morty": [
    {
      id: "tortured_by_rick",
      title: "The Making of Evil",
      description: "The Rick who broke him",
      requiredAffection: 80,
      category: "trauma"
    },
    {
      id: "taking_control",
      title: "Turning the Tables",
      description: "The first taste of power",
      requiredAffection: 60,
      category: "revenge"
    },
    {
      id: "citadel_infiltration",
      title: "The Long Game",
      description: "Infiltrating the Citadel of Ricks",
      requiredAffection: 50,
      category: "strategy"
    },
    {
      id: "curve_escape",
      title: "Breaking Free",
      description: "Escaping the Central Finite Curve",
      requiredAffection: 70,
      category: "freedom"
    },
    {
      id: "morty_philosophy",
      title: "The Morty Question",
      description: "His views on other Mortys",
      requiredAffection: 40,
      category: "philosophy"
    }
  ],
  "Rick Prime": [
    {
      id: "diane_murder",
      title: "The First Strike",
      description: "Why he killed Diane and Beth",
      requiredAffection: 90,
      category: "murder"
    },
    {
      id: "omega_device",
      title: "Ultimate Weapon",
      description: "The device that erased Diane from all realities",
      requiredAffection: 85,
      category: "destruction"
    },
    {
      id: "rick_rivalry",
      title: "The Chosen Enemy",
      description: "Why Rick C-137 interests him",
      requiredAffection: 75,
      category: "rivalry"
    },
    {
      id: "power_philosophy",
      title: "God Complex",
      description: "What it means to be the Infinite Rick",
      requiredAffection: 80,
      category: "power"
    },
    {
      id: "family_abandonment",
      title: "Leaving Everything Behind",
      description: "Why family means nothing to him",
      requiredAffection: 70,
      category: "abandonment"
    }
  ]
};

const categoryColors = {
  tragedy: "bg-red-500/20 text-red-300 border-red-500/30",
  science: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  family: "bg-green-500/20 text-green-300 border-green-500/30",
  friendship: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  love: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  trauma: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  violence: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  revelation: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  revenge: "bg-red-600/20 text-red-400 border-red-600/30",
  strategy: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  freedom: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  philosophy: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  murder: "bg-red-700/20 text-red-400 border-red-700/30",
  destruction: "bg-gray-600/20 text-gray-300 border-gray-600/30",
  rivalry: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  power: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  abandonment: "bg-stone-500/20 text-stone-300 border-stone-500/30"
};

export default function BackstoryExplorer({ 
  isOpen, 
  onClose, 
  character, 
  gameState,
  onBackstoryUnlock 
}: BackstoryExplorerProps) {
  const [selectedBackstory, setSelectedBackstory] = useState<string | null>(null);
  const [backstoryDialogue, setBackstoryDialogue] = useState<string | null>(null);
  const { toast } = useToast();

  const unlockBackstoryMutation = useMutation({
    mutationFn: (backstoryId: string) =>
      apiRequest('/api/unlock-backstory', {
        method: 'POST',
        body: {
          gameStateId: gameState?.id,
          backstoryId
        }
      }),
    onSuccess: (data: any, backstoryId: string) => {
      toast({
        title: "Backstory Unlocked",
        description: "You can now explore this memory",
      });
      onBackstoryUnlock?.(backstoryId);
    },
    onError: (error: any) => {
      toast({
        title: "Unlock Failed",
        description: error.message || "Failed to unlock backstory",
        variant: "destructive"
      });
    }
  });

  const generateBackstoryMutation = useMutation({
    mutationFn: (backstoryId: string) =>
      apiRequest('/api/backstory-dialogue', {
        method: 'POST',
        body: {
          characterId: character?.id,
          backstoryId,
          gameStateId: gameState?.id
        }
      }),
    onSuccess: (data: any) => {
      setBackstoryDialogue(data.message);
    },
    onError: (error: any) => {
      toast({
        title: "Story Failed",
        description: error.message || "Failed to generate backstory",
        variant: "destructive"
      });
    }
  });

  const characterBackstories = backstoryDefinitions[character?.name as keyof typeof backstoryDefinitions] || [];
  const unlockedBackstories = gameState?.unlockedBackstories || [];
  const currentAffection = gameState?.affectionLevel || 0;

  const isBackstoryUnlocked = (backstoryId: string) => {
    return unlockedBackstories.includes(backstoryId);
  };

  const canUnlockBackstory = (requiredAffection: number) => {
    return currentAffection >= requiredAffection;
  };

  const handleUnlockBackstory = (backstoryId: string) => {
    unlockBackstoryMutation.mutate(backstoryId);
  };

  const handleExploreBackstory = (backstoryId: string) => {
    setSelectedBackstory(backstoryId);
    setBackstoryDialogue(null);
    generateBackstoryMutation.mutate(backstoryId);
  };

  const renderBackstoryCard = (backstory: any) => {
    const isUnlocked = isBackstoryUnlocked(backstory.id);
    const canUnlock = canUnlockBackstory(backstory.requiredAffection);
    const categoryColor = categoryColors[backstory.category as keyof typeof categoryColors] || categoryColors.philosophy;

    return (
      <div
        key={backstory.id}
        className={`
          border-2 rounded-lg p-4 transition-all
          ${isUnlocked 
            ? 'border-teal-400 bg-teal-400/10' 
            : canUnlock 
              ? 'border-yellow-500 bg-yellow-500/10 hover:border-yellow-400' 
              : 'border-slate-700 bg-slate-800/30 opacity-60'
          }
        `}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {isUnlocked ? (
                <Unlock className="w-4 h-4 text-teal-400" />
              ) : canUnlock ? (
                <Calendar className="w-4 h-4 text-yellow-400" />
              ) : (
                <Lock className="w-4 h-4 text-slate-500" />
              )}
              <h3 className="font-semibold text-white">{backstory.title}</h3>
            </div>
            <p className="text-slate-300 text-sm mb-2">{backstory.description}</p>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`text-xs border ${categoryColor}`}>
                {backstory.category}
              </Badge>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Heart className="w-3 h-3" />
                <span>{backstory.requiredAffection}% required</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isUnlocked && canUnlock && (
            <Button
              onClick={() => handleUnlockBackstory(backstory.id)}
              disabled={unlockBackstoryMutation.isPending}
              size="sm"
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <Unlock className="w-3 h-3 mr-1" />
              Unlock
            </Button>
          )}
          
          {isUnlocked && (
            <Button
              onClick={() => handleExploreBackstory(backstory.id)}
              disabled={generateBackstoryMutation.isPending}
              size="sm"
              variant="outline"
            >
              <Play className="w-3 h-3 mr-1" />
              Explore
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Book className="w-5 h-5" />
            {character?.name} - Origin Route
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Unlock and explore interdimensional backstories as your relationship grows
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Backstories List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-slate-300">
                Current Affection: {currentAffection}%
              </span>
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-3 pr-4">
                {characterBackstories.map(renderBackstoryCard)}
              </div>
            </ScrollArea>
          </div>

          {/* Backstory Content */}
          <div className="border-l border-slate-700 pl-6">
            {selectedBackstory ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CharacterSprite 
                    character={character} 
                    emotion="nostalgic"
                    size="small"
                  />
                  <div>
                    <h3 className="font-semibold text-white">
                      {characterBackstories.find(b => b.id === selectedBackstory)?.title}
                    </h3>
                    <p className="text-sm text-slate-400">Memory Sequence</p>
                  </div>
                </div>

                <ScrollArea className="h-[320px]">
                  <div className="space-y-4 pr-4">
                    {generateBackstoryMutation.isPending ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-teal-400">Accessing memory...</div>
                      </div>
                    ) : backstoryDialogue ? (
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {backstoryDialogue}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 py-8">
                        Select a backstory to explore
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center text-slate-500">
                  <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a backstory to begin exploring</p>
                  <p className="text-sm mt-2">
                    Build your relationship to unlock more memories
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button onClick={onClose} variant="outline">
            Close Archive
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}