import { useState } from "react";
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
import { Zap, User, Gamepad2 } from "lucide-react";

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

  const onSubmit = async (data: UserFormData) => {
    setIsLoading(true);
    playUISound('click');
    createUserMutation.mutate(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal-400 rounded-full opacity-60"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight 
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mb-6"
          >
            <Zap className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Rick & Morty
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-semibold text-teal-400 mb-4"
          >
            Dating Simulator
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-300 text-lg"
          >
            Enter the multiverse of interdimensional romance
          </motion.p>
        </div>

        <Card className="bg-slate-800/90 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <User className="w-5 h-5 text-teal-400" />
              Create Your Profile
            </CardTitle>
            <CardDescription className="text-slate-400">
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
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold py-3"
                >
                  {isLoading || createUserMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      Enter the Multiverse
                    </div>
                  )}
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