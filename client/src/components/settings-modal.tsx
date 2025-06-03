import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, Eye, EyeOff, Save, RotateCcw, Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGameContext } from "@/context/game-context";
import { useToast } from "@/hooks/use-toast";

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
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { gameState, setGameState } = useGameContext();
  const { toast } = useToast();
  const [settings, setSettings] = useState(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from game state
  useEffect(() => {
    if (gameState?.settings) {
      setSettings({ ...defaultSettings, ...gameState.settings });
    }
  }, [gameState]);

  // Track changes
  useEffect(() => {
    const originalSettings = gameState?.settings || defaultSettings;
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, gameState]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (gameState) {
      setGameState({
        ...gameState,
        settings,
      });
    }
    
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
    
    setHasChanges(false);
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
