import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, Star, Skull, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RandomEventProps {
  character: any;
  onEventComplete: (affectionChange: number) => void;
}

const randomEvents = {
  rick: [
    {
      id: "portal_malfunction",
      title: "Portal Gun Malfunction!",
      description: "Rick's portal gun starts sparking and opens a portal to the Citadel of Ricks!",
      icon: Zap,
      choices: [
        { text: "Help fix it", affectionChange: 3, response: "*burp* Not bad, you actually know which end of a screwdriver to hold." },
        { text: "Run away", affectionChange: -2, response: "*burp* Yeah, that's what I thought. Coward." },
        { text: "Jump through portal", affectionChange: 1, response: "*burp* Well that was stupid... but kinda brave. I respect that." }
      ]
    },
    {
      id: "drunk_science",
      title: "Drunk Science Experiment",
      description: "Rick offers you some of his experimental alcohol that might give you superpowers... or kill you.",
      icon: Skull,
      choices: [
        { text: "Drink it", affectionChange: 4, response: "*burp* Holy shit, you actually did it! You're either brave or really stupid. I like both." },
        { text: "Refuse politely", affectionChange: 1, response: "*burp* Smart choice. It probably would've killed you anyway." },
        { text: "Suggest testing it first", affectionChange: 2, response: "*burp* Look at you being all scientific. Not terrible advice." }
      ]
    },
    {
      id: "morty_rescue",
      title: "Morty in Danger!",
      description: "Morty is trapped in another dimension and Rick needs to choose between saving him or continuing your date.",
      icon: AlertTriangle,
      choices: [
        { text: "Insist he saves Morty", affectionChange: 3, response: "*burp* Fine, but you're coming with me. Can't let you get all self-righteous on me." },
        { text: "Say Morty will be fine", affectionChange: -1, response: "*burp* Wow, cold. I mean, you're probably right, but still... cold." },
        { text: "Offer to help rescue him", affectionChange: 4, response: "*burp* Alright, now that's what I'm talking about! Let's go save my idiot grandson." }
      ]
    }
  ],
  morty: [
    {
      id: "rick_abandons",
      title: "Rick Abandons You Both",
      description: "Rick leaves you and Morty stranded in an alien dimension during your date!",
      icon: AlertTriangle,
      choices: [
        { text: "Comfort Morty", affectionChange: 3, response: "Th-thanks... Rick does this all the time, but it still hurts, you know?" },
        { text: "Blame Morty", affectionChange: -2, response: "W-what?! How is this my fault?! Rick's the one who left us here!" },
        { text: "Find a way home together", affectionChange: 4, response: "Y-you really think we can do it? Together? That... that means a lot to me." }
      ]
    },
    {
      id: "school_stress",
      title: "School Problems",
      description: "Morty is stressed about a big test while also dealing with interdimensional trauma.",
      icon: Star,
      choices: [
        { text: "Help him study", affectionChange: 3, response: "Wow, someone actually cares about my education? That's... that's really nice." },
        { text: "Say school doesn't matter", affectionChange: 1, response: "I-I mean, you're probably right, but my parents would kill me if I failed..." },
        { text: "Suggest skipping school", affectionChange: 2, response: "That's... that's actually tempting. Rick would probably approve of that advice." }
      ]
    }
  ]
};

export default function RandomEvents({ character, onEventComplete }: RandomEventProps) {
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [eventResponse, setEventResponse] = useState<string>("");

  useEffect(() => {
    // Trigger random events occasionally
    const eventTimer = setInterval(() => {
      if (Math.random() < 0.15 && !currentEvent) { // 15% chance every interval
        triggerRandomEvent();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(eventTimer);
  }, [character, currentEvent]);

  const triggerRandomEvent = () => {
    if (!character) return;
    
    const characterEvents = randomEvents[character.name.toLowerCase().includes('rick') ? 'rick' : 'morty'] || [];
    if (characterEvents.length > 0) {
      const randomEvent = characterEvents[Math.floor(Math.random() * characterEvents.length)];
      setCurrentEvent(randomEvent);
    }
  };

  const handleChoice = (choice: any) => {
    setEventResponse(choice.response);
    setTimeout(() => {
      onEventComplete(choice.affectionChange);
      setCurrentEvent(null);
      setEventResponse("");
    }, 3000);
  };

  if (!currentEvent) return null;

  const IconComponent = currentEvent.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <Card className="w-full max-w-md mx-4 bg-card/95 backdrop-blur-md border-primary/50">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <IconComponent className="w-12 h-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-bold text-primary">{currentEvent.title}</h3>
              <p className="text-muted-foreground mt-2">{currentEvent.description}</p>
            </div>

            {eventResponse ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <p className="text-sm italic">{eventResponse}</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-2">
                {currentEvent.choices.map((choice: any, index: number) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full text-left justify-start h-auto p-3"
                    onClick={() => handleChoice(choice)}
                  >
                    {choice.text}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}