import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, UserCheck, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsPage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8 pt-8"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="h-6 w-px bg-slate-600" />
          <h1 className="text-2xl font-bold text-white">Terms & Privacy Policy</h1>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Disclaimer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-slate-800/50 border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                  Important Disclaimer
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-3">
                <p>
                  <strong>This is an unofficial fan project created for entertainment purposes only.</strong>
                </p>
                <p>
                  Rick and Morty and all related characters, names, marks, emblems, and images are 
                  trademarks of Adult Swim, Cartoon Network, and Dan Harmon. This project is not 
                  affiliated with, endorsed by, or sponsored by Adult Swim, Cartoon Network, 
                  Turner Broadcasting System, or any of their subsidiaries or affiliates.
                </p>
                <p>
                  All rights to the Rick and Morty intellectual property belong to their respective owners. 
                  This fan project is created under fair use principles for non-commercial, 
                  educational, and transformative purposes.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Shield className="w-5 h-5" />
                  Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-teal-400">Data Collection</h3>
                  <p>
                    <strong>We do NOT collect, store, or transmit any personal information to external servers.</strong>
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>All game data is stored locally in your browser's local storage</li>
                    <li>No usernames, passwords, or personal information is sent to our servers</li>
                    <li>No tracking cookies or analytics are used</li>
                    <li>No third-party data collection services are integrated</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-teal-400">Local Storage</h3>
                  <p>
                    The application uses browser local storage to save your game progress, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Your chosen username (stored locally only)</li>
                    <li>Character selection and relationship progress</li>
                    <li>Game settings and preferences</li>
                    <li>Conversation history and unlocked content</li>
                  </ul>
                  <p className="text-sm mt-2 text-slate-400">
                    This data never leaves your device and can be cleared by clearing your browser's local storage.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-teal-400">AI Integration</h3>
                  <p>
                    If you choose to use AI-powered conversations, note that:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>You must provide your own API keys for AI services</li>
                    <li>Your conversations may be processed by third-party AI providers</li>
                    <li>We recommend reviewing the privacy policies of AI providers you choose to use</li>
                    <li>API keys are stored locally in your browser and never transmitted to our servers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Terms of Use */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-400">
                  <UserCheck className="w-5 h-5" />
                  Terms of Use
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-teal-400">Acceptable Use</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>This application is for personal, non-commercial use only</li>
                    <li>Users must be 18+ to use AI-powered features</li>
                    <li>Do not attempt to reverse engineer or redistribute the application</li>
                    <li>Report any bugs or issues through appropriate channels</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-teal-400">Content Guidelines</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Content generated is for entertainment purposes only</li>
                    <li>AI-generated content may not always be appropriate or accurate</li>
                    <li>Users are responsible for their own interactions with AI services</li>
                    <li>This is a parody/fan work protected under fair use principles</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-teal-400">Liability</h3>
                  <p className="text-sm">
                    This fan project is provided "as is" without warranties. The creators are not 
                    liable for any issues arising from use of the application. Users assume all 
                    risks associated with AI interactions and content generation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Eye className="w-5 h-5" />
                  Transparency & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-3">
                <p className="text-sm">
                  This project is open source and created by fans for fans. If you have concerns 
                  about copyright, privacy, or any other issues, please reach out through the 
                  project's repository or contact channels.
                </p>
                <p className="text-xs text-slate-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pb-8"
          >
            <Button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Game
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}