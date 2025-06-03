import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Eye, EyeOff, Save, RotateCcw, Download, Upload, Trash2, Key, User, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGameContext } from "@/context/game-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const defaultSettings = {
  masterVolume: 75,
  sfxVolume: 50,
  musicVolume: 25,
  animationSpeed: "normal",
  particleEffects: true,
  portalGlow: true,
  autosaveFrequency: 5,
  typingSpeed: "normal",
  nsfwContent: false,
  openrouterApiKey: "",
  aiModel: "deepseek/deepseek-chat-v3-0324:free",
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { gameState, setGameState, currentUser, setCurrentUser } = useGameContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings from game state and user profile
  useEffect(() => {
    if (gameState?.settings) {
      setSettings({ ...defaultSettings, ...gameState.settings });
    }
    if (currentUser?.profilePicture) {
      setProfilePicture(currentUser.profilePicture);
    }
  }, [gameState, currentUser]);

  // Track changes
  useEffect(() => {
    const originalSettings = gameState?.settings || defaultSettings;
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, gameState]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (gameState) {
      // Update local context
      setGameState({
        ...gameState,
        settings,
      });
      
      // Update database
      try {
        await apiRequest("PUT", `/api/game-state/${gameState.id}`, {
          settings,
        });
        
        // Invalidate game state cache to reflect changes
        queryClient.invalidateQueries({ 
          queryKey: [`/api/game-state/${gameState.userId}/${gameState.characterId}`] 
        });
        
        toast({
          title: "Settings Saved",
          description: "Your preferences have been updated successfully.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        });
      }
    }
    
    setHasChanges(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (PNG, JPG, GIF, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfilePicture(result);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture("");
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateProfilePicture = async () => {
    if (!currentUser) return;
    
    try {
      const updatedUser = await apiRequest(`/api/user/${currentUser.id}`, {
        method: "PATCH",
        body: { profilePicture }
      });
      
      setCurrentUser(updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile picture has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to save profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast({
      title: "Settings Reset",
      description: "All settings have been restored to default values.",
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rick-morty-simulator-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Settings Exported",
      description: "Your settings have been downloaded as a JSON file.",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...defaultSettings, ...importedSettings });
        toast({
          title: "Settings Imported",
          description: "Your settings have been imported successfully.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import settings. Please check the file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="glass-morphism rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto portal-glow"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-glow">
              Interdimensional Settings
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-8">
            {/* User Profile */}
            <Card className="glass-morphism/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-muted border-2 border-border overflow-hidden">
                      {profilePicture ? (
                        <img 
                          src={profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div>
                      <label className="text-sm font-medium">Profile Picture</label>
                      <p className="text-xs text-muted-foreground">Upload an image (PNG, JPG, GIF - max 5MB)</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                      </Button>
                      
                      {profilePicture && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeProfilePicture}
                          className="flex items-center space-x-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove</span>
                        </Button>
                      )}
                      
                      {profilePicture !== (currentUser?.profilePicture || "") && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={updateProfilePicture}
                          className="flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Audio Settings */}
            <Card className="glass-morphism/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground flex items-center">
                  <Volume2 className="w-5 h-5 mr-2" />
                  Audio Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium">Master Volume</label>
                      {settings.masterVolume === 0 && <VolumeX className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[3ch]">
                      {settings.masterVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.masterVolume]}
                    onValueChange={([value]) => handleSettingChange('masterVolume', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Sound Effects</label>
                    <span className="text-sm text-muted-foreground min-w-[3ch]">
                      {settings.sfxVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.sfxVolume]}
                    onValueChange={([value]) => handleSettingChange('sfxVolume', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Background Music</label>
                    <span className="text-sm text-muted-foreground min-w-[3ch]">
                      {settings.musicVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[settings.musicVolume]}
                    onValueChange={([value]) => handleSettingChange('musicVolume', value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visual Settings */}
            <Card className="glass-morphism/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Visual Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Animation Speed</label>
                    <p className="text-xs text-muted-foreground">Controls character and UI animations</p>
                  </div>
                  <Select
                    value={settings.animationSpeed}
                    onValueChange={(value) => handleSettingChange('animationSpeed', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Particle Effects</label>
                    <p className="text-xs text-muted-foreground">Floating portal particles and effects</p>
                  </div>
                  <Switch
                    checked={settings.particleEffects}
                    onCheckedChange={(checked) => handleSettingChange('particleEffects', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Portal Glow Effects</label>
                    <p className="text-xs text-muted-foreground">Glowing borders and text effects</p>
                  </div>
                  <Switch
                    checked={settings.portalGlow}
                    onCheckedChange={(checked) => handleSettingChange('portalGlow', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">NSFW Content</label>
                    <p className="text-xs text-muted-foreground">Allow mature content in conversations</p>
                  </div>
                  <Switch
                    checked={settings.nsfwContent}
                    onCheckedChange={(checked) => handleSettingChange('nsfwContent', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI Configuration */}
            <Card className="glass-morphism/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium flex items-center">
                      OpenRouter API Key
                      <span className="ml-2 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">Required for AI</span>
                    </label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Enter your OpenRouter API key to enable AI-powered character conversations
                    </p>
                  </div>
                  <Input
                    type="password"
                    placeholder="sk-or-v1-..."
                    value={settings.openrouterApiKey}
                    onChange={(e) => handleSettingChange('openrouterApiKey', e.target.value)}
                    className="glass-morphism/50 border-border/30 focus:border-primary/50"
                  />
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p className="font-medium text-secondary-foreground">How to get your OpenRouter API key:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai</a></li>
                      <li>Click "Sign Up" and create a free account</li>
                      <li>Go to "API Keys" in your dashboard</li>
                      <li>Click "Create Key" and give it a name</li>
                      <li>Copy the key that starts with "sk-or-v1-"</li>
                      <li>Paste it in the field above</li>
                    </ol>
                    <p className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400">
                      💡 All models are free to use with your OpenRouter account. You get $1 starting credit to begin conversations.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">AI Model</label>
                    <p className="text-xs text-muted-foreground mb-2">
                      Choose the AI model for character responses
                    </p>
                  </div>
                  <Select
                    value={settings.aiModel}
                    onValueChange={(value) => handleSettingChange('aiModel', value)}
                  >
                    <SelectTrigger className="glass-morphism/50 border-border/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek/deepseek-chat-v3-0324:free">DeepSeek Chat v3 (Default)</SelectItem>
                      <SelectItem value="deepseek/deepseek-r1:free">DeepSeek R1 (Reasoning)</SelectItem>
                      <SelectItem value="deepseek/deepseek-r1-0528:free">DeepSeek R1 Updated</SelectItem>
                      <SelectItem value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Experimental)</SelectItem>
                      <SelectItem value="deepseek/deepseek-chat:free">DeepSeek Chat</SelectItem>
                      <SelectItem value="google/gemma-3-27b-it:free">Gemma 3 27B</SelectItem>
                      <SelectItem value="mistralai/mistral-nemo:free">Mistral Nemo</SelectItem>
                      <SelectItem value="meta-llama/llama-4-maverick:free">Llama 4 Maverick</SelectItem>
                      <SelectItem value="mistralai/mistral-7b-instruct:free">Mistral 7B</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground">
                    <p>Choose the AI model that best fits your conversation style. Each model has unique strengths and capabilities.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gameplay Settings */}
            <Card className="glass-morphism/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground">
                  Gameplay Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Auto-save Frequency</label>
                    <p className="text-xs text-muted-foreground">How often to save your progress</p>
                  </div>
                  <Select
                    value={settings.autosaveFrequency.toString()}
                    onValueChange={(value) => handleSettingChange('autosaveFrequency', parseInt(value))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every Message</SelectItem>
                      <SelectItem value="5">Every 5 Messages</SelectItem>
                      <SelectItem value="10">Every 10 Messages</SelectItem>
                      <SelectItem value="0">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Typing Speed</label>
                    <p className="text-xs text-muted-foreground">Character dialogue typing animation speed</p>
                  </div>
                  <Select
                    value={settings.typingSpeed}
                    onValueChange={(value) => handleSettingChange('typingSpeed', value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instant">Instant</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Mature Content</label>
                    <p className="text-xs text-muted-foreground">Enable adult themes and language</p>
                  </div>
                  <Switch
                    checked={settings.nsfwContent}
                    onCheckedChange={(checked) => handleSettingChange('nsfwContent', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="glass-morphism/30 border-border/30">
              <CardHeader>
                <CardTitle className="text-lg text-secondary-foreground">
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleExport}
                    variant="outline"
                    className="glass-morphism/50 border-blue-400/20 hover:border-blue-400/50 hover:bg-blue-400/10"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Settings
                  </Button>

                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button
                      variant="outline"
                      className="w-full glass-morphism/50 border-green-400/20 hover:border-green-400/50 hover:bg-green-400/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Settings
                    </Button>
                  </div>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="md:col-span-2 glass-morphism/50 border-red-400/20 hover:border-red-400/50 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/20">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 glass-morphism/50 border-muted hover:bg-muted/10"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                className="flex-1 glass-morphism/50 border-orange-400/20 hover:border-orange-400/50 hover:bg-orange-400/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex-1 btn-portal"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>

            {hasChanges && (
              <motion.div
                className="text-center text-sm text-yellow-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                You have unsaved changes
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
