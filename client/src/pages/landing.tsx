import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useGameContext } from "@/context/game-context";
import { apiRequest } from "@/lib/queryClient";
import { playUISound } from "@/lib/audio";
import { Zap, User, Gamepad2, Volume2, VolumeX } from "lucide-react";
import themeMusic from "@assets/Rick and Morty.mp3";
import spaceBackground from "@assets/unnamed.png";

const userSchema = z.object({
  username: z.string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
});

type UserFormData = z.infer<typeof userSchema>;

interface LandingPageProps {
  onUserCreated: () => void;
}

export default function LandingPage({ onUserCreated }: LandingPageProps) {
  const { setCurrentUser } = useGameContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserFormData) => {
      return await apiRequest("/api/users", {
        method: "POST",
        body: userData
      });
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      toast({
        title: "Welcome to the Multiverse!",
        description: `Account created for ${user.username}. Ready for interdimensional romance?`,
      });
      playUISound('success');
      onUserCreated();
    },
    onError: (error: any) => {
      toast({
        title: "Account Creation Failed",
        description: error.message || "Unable to create account. Please try again.",
        variant: "destructive",
      });
      playUISound('error');
    },
  });

  // Music controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
      audioRef.current.loop = true;
      // Auto-play music when component mounts
      if (isMusicPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  }, [musicVolume]);

  useEffect(() => {
    if (audioRef.current && isMusicPlaying) {
      audioRef.current.play().catch(console.error);
    }
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    playUISound('click');
    createUserMutation.mutate(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Audio element for theme music */}
      <audio ref={audioRef} src={themeMusic} preload="auto" />
      
      {/* Music control button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="absolute top-6 right-6 z-50"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMusic}
          className="glass-morphism/50 border border-green-400/30 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300"
          title={isMusicPlaying ? "Pause Music" : "Play Music"}
        >
          {isMusicPlaying ? (
            <Volume2 className="w-5 h-5 text-green-400" />
          ) : (
            <VolumeX className="w-5 h-5 text-green-400" />
          )}
        </Button>
      </motion.div>

      {/* Animated starry background */}
      <div className="absolute inset-0">
        {/* Stars field */}
        {[...Array(150)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white rounded-full shadow-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              boxShadow: `0 0 ${Math.random() * 6 + 2}px rgba(255, 255, 255, 0.8)`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`shooting-star-${i}`}
            className="absolute h-px bg-gradient-to-r from-transparent via-white to-transparent"
            style={{
              left: `${Math.random() * 50}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 100 + 50,
            }}
            animate={{
              x: ['-100px', '100vw'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              delay: Math.random() * 10 + 5,
              ease: "easeOut",
            }}
          />
        ))}
        
        {/* Nebula effects */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`nebula-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              background: `radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 50%, transparent 100%)`,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: Math.random() * 8 + 6,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Enhanced animated background */}
      <div className="absolute inset-0">
        {/* Large portal rings in background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border-2 border-green-400/20 animate-spin-slow" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full border-2 border-green-300/15 animate-spin-reverse" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full border border-green-500/10 animate-spin-slow" />
        
        {/* Floating energy particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0 ? 'w-2 h-2 bg-green-400' : 
              i % 3 === 1 ? 'w-1.5 h-1.5 bg-green-300' : 'w-1 h-1 bg-green-500'
            } opacity-60`}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0.5, 1]
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Energy streams */}
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-green-400/30 to-transparent animate-pulse" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.3, duration: 1.5 }}
            className="inline-flex items-center justify-center w-24 h-24 mb-6 relative"
          >
            {/* Realistic Portal Structure */}
            {/* Outer portal ring */}
            <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-spin-slow opacity-80">
              <div className="absolute inset-1 rounded-full border-2 border-green-300 animate-spin-reverse opacity-60"></div>
            </div>
            
            {/* Inner portal energy */}
            <div className="absolute inset-2 rounded-full bg-gradient-radial from-green-400 via-green-500 to-green-900 animate-pulse">
              <div className="absolute inset-1 rounded-full bg-gradient-radial from-green-300 via-transparent to-green-800 animate-spin opacity-70"></div>
              <div className="absolute inset-2 rounded-full bg-gradient-radial from-white via-green-200 to-transparent animate-ping opacity-50"></div>
            </div>
            
            {/* Portal center */}
            <div className="absolute inset-4 rounded-full bg-black border border-green-300 shadow-inner">
              <div className="absolute inset-0.5 rounded-full bg-gradient-radial from-green-400 via-green-900 to-black animate-pulse opacity-80"></div>
            </div>
            
            {/* Energy particles around portal */}
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-green-300 rounded-full animate-bounce opacity-70"></div>
            <div className="absolute bottom-0 right-1/4 w-0.5 h-0.5 bg-green-400 rounded-full animate-ping"></div>
            <div className="absolute left-0 top-1/3 w-0.5 h-0.5 bg-green-200 rounded-full animate-pulse"></div>
            <div className="absolute right-0 bottom-1/3 w-0.5 h-0.5 bg-green-500 rounded-full animate-bounce"></div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="text-4xl font-bold text-white mb-2 text-glow"
            style={{
              textShadow: '0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3)',
            }}
          >
            Rick & Morty
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
            className="text-2xl font-semibold text-green-400 mb-4"
            style={{
              textShadow: '0 0 15px rgba(34, 197, 94, 0.6)',
            }}
          >
            Dating Simulator
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-300 text-lg leading-relaxed"
          >
            Enter the multiverse of interdimensional romance
          </motion.p>
        </div>

        <Card className="bg-slate-800/95 border-green-400/30 backdrop-blur-sm shadow-2xl shadow-green-400/10 relative overflow-hidden">
          {/* Card glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 via-transparent to-green-600/5 pointer-events-none" />
          
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-white flex items-center justify-center gap-2 text-xl">
              <User className="w-5 h-5 text-green-400" />
              Create Your Profile
            </CardTitle>
            <CardDescription className="text-slate-300 text-base leading-relaxed">
              Choose a username to begin your interdimensional dating adventure
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your username..."
                          className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-teal-400 focus:ring-teal-400"
                          disabled={isLoading || createUserMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading || createUserMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 
                           text-white font-semibold py-3 text-lg border border-green-400/50 
                           shadow-lg shadow-green-400/25 hover:shadow-xl hover:shadow-green-400/40 
                           transition-all duration-300 hover:scale-105 active:scale-95 relative overflow-hidden"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 animate-pulse" />
                  
                  <div className="relative z-10">
                    {isLoading || createUserMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Opening Portal...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4" />
                        Enter the Multiverse
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="text-center text-sm text-slate-400">
                <p className="mb-2">Features you'll unlock:</p>
                <ul className="space-y-1 text-xs">
                  <li>• AI-powered conversations with Rick & Morty characters</li>
                  <li>• Save multiple relationship progressions</li>
                  <li>• Unlock character origin stories and backstories</li>
                  <li>• Dynamic affection system with real consequences</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-6 text-xs text-slate-500"
        >
          Ready to date across dimensions? Your username will be your identity in the multiverse.
        </motion.div>
      </motion.div>
    </div>
  );
}