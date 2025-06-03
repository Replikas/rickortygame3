import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Trash2, Calendar, User, Heart } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SaveSlot {
  id: number;
  userId: number;
  slotNumber: number;
  gameStateSnapshot: any;
  dialogueCount: number;
  characterName: string;
  affectionLevel: number;
  relationshipStatus: string;
  createdAt: string;
  updatedAt: string;
}

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  currentGameState?: any;
  onLoadGame?: (gameState: any) => void;
}

export default function SaveLoadModal({ 
  isOpen, 
  onClose, 
  userId, 
  currentGameState,
  onLoadGame 
}: SaveLoadModalProps) {
  const [mode, setMode] = useState<'save' | 'load'>('save');
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: saveSlots = [], isLoading } = useQuery({
    queryKey: ['/api/save-slots', userId],
    enabled: isOpen
  });

  const saveGameMutation = useMutation({
    mutationFn: (data: { userId: number; slotNumber: number; gameStateId: number }) =>
      apiRequest('/api/save-game', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      toast({
        title: "Game Saved",
        description: `Successfully saved to slot ${selectedSlot}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/save-slots', userId] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save game",
        variant: "destructive"
      });
    }
  });

  const loadGameMutation = useMutation({
    mutationFn: (data: { userId: number; slotNumber: number }) =>
      apiRequest('/api/load-game', {
        method: 'POST',
        body: data
      }),
    onSuccess: (data: any) => {
      toast({
        title: "Game Loaded",
        description: `Successfully loaded ${data.saveInfo.characterName} save`,
      });
      onLoadGame?.(data.gameState);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Load Failed",
        description: error.message || "Failed to load game",
        variant: "destructive"
      });
    }
  });

  const deleteSaveMutation = useMutation({
    mutationFn: (data: { userId: number; slotNumber: number }) =>
      apiRequest(`/api/save-slots/${data.userId}/${data.slotNumber}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      toast({
        title: "Save Deleted",
        description: `Deleted save slot ${selectedSlot}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/save-slots', userId] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete save",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!currentGameState?.id) {
      toast({
        title: "No Game State",
        description: "No active game to save",
        variant: "destructive"
      });
      return;
    }

    saveGameMutation.mutate({
      userId,
      slotNumber: selectedSlot,
      gameStateId: currentGameState.id
    });
  };

  const handleLoad = () => {
    loadGameMutation.mutate({
      userId,
      slotNumber: selectedSlot
    });
  };

  const handleDelete = (slotNumber: number) => {
    deleteSaveMutation.mutate({
      userId,
      slotNumber
    });
  };

  const getSaveSlot = (slotNumber: number): SaveSlot | undefined => {
    return saveSlots.find((slot: SaveSlot) => slot.slotNumber === slotNumber);
  };

  const renderSaveSlot = (slotNumber: number) => {
    const saveSlot = getSaveSlot(slotNumber);
    const isSelected = selectedSlot === slotNumber;

    return (
      <div
        key={slotNumber}
        className={`
          border-2 rounded-lg p-4 cursor-pointer transition-all
          ${isSelected 
            ? 'border-teal-400 bg-teal-400/10' 
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }
        `}
        onClick={() => setSelectedSlot(slotNumber)}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">Slot {slotNumber}</h3>
          {saveSlot && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(slotNumber);
              }}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {saveSlot ? (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4" />
              <span>{saveSlot.characterName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Heart className="w-4 h-4" />
              <span>{saveSlot.affectionLevel}% • {saveSlot.relationshipStatus}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(saveSlot.updatedAt), 'MMM d, yyyy HH:mm')}</span>
            </div>
            <div className="text-slate-400">
              {saveSlot.dialogueCount} conversations
            </div>
          </div>
        ) : (
          <div className="text-slate-500 text-sm">
            Empty slot
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Save & Load Game</DialogTitle>
          <DialogDescription className="text-slate-400">
            Manage your game saves across multiple slots
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'save' ? 'default' : 'outline'}
              onClick={() => setMode('save')}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Game
            </Button>
            <Button
              variant={mode === 'load' ? 'default' : 'outline'}
              onClick={() => setMode('load')}
              className="flex-1"
            >
              <Loader2 className="w-4 h-4 mr-2" />
              Load Game
            </Button>
          </div>

          {/* Save Slots Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map(renderSaveSlot)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            
            {mode === 'save' ? (
              <Button
                onClick={handleSave}
                disabled={!currentGameState?.id || saveGameMutation.isPending}
                className="flex-1 bg-teal-600 hover:bg-teal-700"
              >
                {saveGameMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save to Slot {selectedSlot}
              </Button>
            ) : (
              <Button
                onClick={handleLoad}
                disabled={!getSaveSlot(selectedSlot) || loadGameMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loadGameMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Loader2 className="w-4 h-4 mr-2" />
                )}
                Load Slot {selectedSlot}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}