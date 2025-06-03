import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Heart, 
  Save, 
  Settings, 
  MessageCircle, 
  Lock, 
  Volume2, 
  Gamepad2,
  Zap,
  Users,
  Eye,
  HelpCircle
} from "lucide-react";

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentationModal({ isOpen, onClose }: DocumentationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-slate-900 border-slate-700 max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2 text-xl">
            <Book className="w-6 h-6 text-teal-400" />
            Rick and Morty Dating Simulator - User Guide
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Complete guide to navigating the interdimensional dating experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="progression">Progression</TabsTrigger>
            <TabsTrigger value="troubleshooting">Help</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="getting-started" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-teal-400" />
                  Welcome to the Multiverse
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Experience interdimensional romance with your favorite Rick and Morty characters. 
                  This AI-powered dating simulator lets you build relationships through meaningful conversations 
                  and unlock character backstories as your connection deepens.
                </p>

                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-white">Quick Start Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Select a character from the interdimensional roster</li>
                    <li>Configure your OpenRouter API key in settings for AI conversations</li>
                    <li>Choose response options or type custom messages</li>
                    <li>Build affection through engaging dialogue</li>
                    <li>Unlock Origin Routes at 25% affection to explore backstories</li>
                    <li>Save your progress using the Save/Load system</li>
                  </ol>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium text-yellow-300">API Key Required</span>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    You'll need an OpenRouter API key for AI-powered conversations. 
                    Visit openrouter.ai to get your free key and add it in the settings menu.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-blue-400" />
                    <h4 className="font-medium text-white">AI Conversations</h4>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Dynamic, personality-driven dialogue powered by advanced AI. Each character 
                    responds authentically based on their Rick and Morty personality traits.
                  </p>
                  <Badge variant="outline" className="text-blue-300 border-blue-500/30">
                    Requires API Key
                  </Badge>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <h4 className="font-medium text-white">Affection System</h4>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Build relationships through your choices. Your dialogue options affect 
                    affection levels and unlock new conversation paths and features.
                  </p>
                  <Badge variant="outline" className="text-pink-300 border-pink-500/30">
                    Progress Tracking
                  </Badge>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-purple-400" />
                    <h4 className="font-medium text-white">Origin Routes</h4>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Unlock character backstories and explore their interdimensional origins. 
                    Each character has unique story segments that reveal their deeper lore.
                  </p>
                  <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                    Unlocks at 25% Affection
                  </Badge>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Save className="w-5 h-5 text-green-400" />
                    <h4 className="font-medium text-white">Save System</h4>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Six save slots let you maintain multiple relationships or experiment 
                    with different conversation paths without losing progress.
                  </p>
                  <Badge variant="outline" className="text-green-300 border-green-500/30">
                    6 Save Slots
                  </Badge>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-orange-400" />
                    <h4 className="font-medium text-white">Character Audio</h4>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Authentic sound effects and character voices enhance the immersive 
                    experience with reactions based on conversation context.
                  </p>
                  <Badge variant="outline" className="text-orange-300 border-orange-500/30">
                    Contextual Audio
                  </Badge>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-medium text-white">Character Sprites</h4>
                  </div>
                  <p className="text-slate-300 text-sm">
                    Animated character visuals with emotional states that respond to 
                    conversation flow and relationship dynamics.
                  </p>
                  <Badge variant="outline" className="text-cyan-300 border-cyan-500/30">
                    Emotional Reactions
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="characters" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-400" />
                  Available Characters
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-300 font-bold">R</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Rick Sanchez (C-137)</h4>
                        <p className="text-sm text-slate-400">The genius scientist with a dark past</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Cynical, brilliant, and emotionally complex. Rick's conversations blend 
                      scientific genius with deep trauma. Unlocking his origin route reveals 
                      the tragic loss of his family and his multiverse-spanning quest for revenge.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-500/20 text-blue-300">Science</Badge>
                      <Badge className="bg-red-500/20 text-red-300">Trauma</Badge>
                      <Badge className="bg-purple-500/20 text-purple-300">Complex</Badge>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-300 font-bold">M</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Morty Smith</h4>
                        <p className="text-sm text-slate-400">The anxious but brave grandson</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Nervous yet surprisingly resilient. Morty's dialogue reflects his growth 
                      from scared teenager to someone who's seen the multiverse's horrors. 
                      His origin route explores his relationship with Rick and personal development.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-300">Anxiety</Badge>
                      <Badge className="bg-green-500/20 text-green-300">Growth</Badge>
                      <Badge className="bg-blue-500/20 text-blue-300">Loyalty</Badge>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-red-300 font-bold">E</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Evil Morty</h4>
                        <p className="text-sm text-slate-400">The Morty who broke free from Rick</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                      Calculating and ruthless, yet deeply intelligent. Evil Morty represents 
                      what happens when a Morty refuses to be Rick's pawn. His origin route 
                      reveals his path to power and escape from the Central Finite Curve.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-red-500/20 text-red-300">Manipulation</Badge>
                      <Badge className="bg-purple-500/20 text-purple-300">Intelligence</Badge>
                      <Badge className="bg-gray-500/20 text-gray-300">Freedom</Badge>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-orange-300 font-bold">P</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white">Rick Prime</h4>
                        <p className="text-sm text-slate-400">The Rick who killed Rick C-137's family</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">
                      The ultimate antagonist - a Rick without emotional attachments. Rick Prime's 
                      conversations are coldly logical yet terrifyingly charismatic. His origin 
                      route explores his philosophy of detachment and multiversal dominance.
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-orange-500/20 text-orange-300">Detachment</Badge>
                      <Badge className="bg-red-500/20 text-red-300">Destruction</Badge>
                      <Badge className="bg-purple-500/20 text-purple-300">Power</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progression" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Relationship Progression
                </h3>

                <div className="space-y-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Affection Levels & Unlocks</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center">
                          <Badge className="bg-gray-500/20 text-gray-300">0-10%</Badge>
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm">Initial conversations, basic responses</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center">
                          <Badge className="bg-blue-500/20 text-blue-300">10-25%</Badge>
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm">Deeper dialogue options, personality hints appear</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center">
                          <Badge className="bg-yellow-500/20 text-yellow-300">25%+</Badge>
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm">
                            <strong>Origin Route unlocked!</strong> Access character backstories and origin secrets
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center">
                          <Badge className="bg-green-500/20 text-green-300">50%+</Badge>
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm">Advanced backstory segments, emotional moments</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-16 text-center">
                          <Badge className="bg-pink-500/20 text-pink-300">75%+</Badge>
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm">Deepest character secrets, full origin stories</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Conversation Tips</h4>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 mt-1">•</span>
                        <span>Choose responses that match the character's personality for better affection gains</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 mt-1">•</span>
                        <span>Type custom messages to explore unique conversation paths</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 mt-1">•</span>
                        <span>Pay attention to character reactions and audio cues for feedback</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 mt-1">•</span>
                        <span>Save frequently to experiment with different dialogue choices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400 mt-1">•</span>
                        <span>Origin Route content provides deeper insight into character motivations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="troubleshooting" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-yellow-400" />
                  Troubleshooting & FAQ
                </h3>

                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <h4 className="font-medium text-red-300 mb-2">AI Conversations Not Working?</h4>
                    <div className="space-y-2 text-sm text-red-200">
                      <p>1. Check that you've added your OpenRouter API key in settings</p>
                      <p>2. Ensure your API key has sufficient credits</p>
                      <p>3. Try refreshing the page if requests are failing</p>
                      <p>4. Verify your internet connection is stable</p>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-300 mb-2">Origin Route Button Locked?</h4>
                    <div className="space-y-2 text-sm text-yellow-200">
                      <p>1. Build your relationship to at least 25% affection</p>
                      <p>2. Engage in multiple conversation rounds</p>
                      <p>3. Try different dialogue approaches for better affection gains</p>
                      <p>4. Check the affection meter in the character info panel</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-medium text-blue-300 mb-2">Save/Load Issues?</h4>
                    <div className="space-y-2 text-sm text-blue-200">
                      <p>1. Ensure you're logged in (automatic account creation)</p>
                      <p>2. Try saving to a different slot</p>
                      <p>3. Check that you have sufficient browser storage</p>
                      <p>4. Refresh the page and try again</p>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Frequently Asked Questions</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-slate-300 font-medium">Q: How do I get an OpenRouter API key?</p>
                        <p className="text-slate-400">A: Visit openrouter.ai, create a free account, and generate an API key. Add it in the settings menu.</p>
                      </div>
                      <div>
                        <p className="text-slate-300 font-medium">Q: Can I date multiple characters simultaneously?</p>
                        <p className="text-slate-400">A: Yes! Use different save slots to maintain separate relationships with different characters.</p>
                      </div>
                      <div>
                        <p className="text-slate-300 font-medium">Q: Do my choices affect the story permanently?</p>
                        <p className="text-slate-400">A: Your dialogue choices build affection and unlock content, but you can always load previous saves to try different approaches.</p>
                      </div>
                      <div>
                        <p className="text-slate-300 font-medium">Q: Is there an ending or completion goal?</p>
                        <p className="text-slate-400">A: The experience is open-ended. Your goal is to build relationships and unlock all Origin Route content for your chosen characters.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button onClick={onClose} className="bg-teal-600 hover:bg-teal-700">
            Close Guide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}