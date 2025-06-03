import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, Star, Skull, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface RandomEventProps {
  character: any;
  conversationHistory?: any[];
  lastMessage?: string;
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

export default function RandomEvents({ character, conversationHistory = [], lastMessage, onEventComplete }: RandomEventProps) {
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [eventResponse, setEventResponse] = useState<string>("");

  useEffect(() => {
    // Trigger random events occasionally - much less frequent
    const eventTimer = setInterval(() => {
      if (Math.random() < 0.02 && !currentEvent && conversationHistory.length > 3) { // 2% chance only after some conversation
        triggerContextualEvent();
      }
    }, 180000); // Check every 3 minutes

    return () => clearInterval(eventTimer);
  }, [character, currentEvent, conversationHistory.length]);

  const generateContextualEvent = () => {
    if (!character || !conversationHistory.length) return null;

    const recentMessages = conversationHistory.slice(-3).map(d => d.message).join(' ');
    const characterName = character.name.toLowerCase();
    
    // Generate events based on conversation topics
    if (recentMessages.includes('science') || recentMessages.includes('experiment')) {
      return generateScienceEvent(characterName);
    } else if (recentMessages.includes('adventure') || recentMessages.includes('dimension')) {
      return generateAdventureEvent(characterName);
    } else if (recentMessages.includes('drunk') || recentMessages.includes('alcohol')) {
      return generateDrinkingEvent(characterName);
    } else if (recentMessages.includes('family') || recentMessages.includes('morty')) {
      return generateFamilyEvent(characterName);
    } else {
      return generateRandomSituationEvent(characterName);
    }
  };

  const generateScienceEvent = (characterName: string) => {
    const scienceEvents = characterName.includes('rick') ? [
      {
        title: "Experiment Gone Wrong!",
        description: `Rick's latest experiment starts ${['glowing dangerously', 'making concerning noises', 'growing tentacles', 'opening micro-portals'][Math.floor(Math.random() * 4)]}.`,
        icon: Zap,
        choices: [
          { text: "Help stabilize it", affectionChange: 3, response: "*burp* Not bad. You might actually have a brain in there." },
          { text: "Suggest evacuating", affectionChange: 1, response: "*burp* Coward. But... probably smart." },
          { text: "Ask what it does", affectionChange: 2, response: "*burp* Curiosity! I like that in a lab partner." }
        ]
      }
    ] : [
      {
        title: "Rick's Science Accident",
        description: "Rick's experiment explodes and Morty needs help cleaning up the mess.",
        icon: AlertTriangle,
        choices: [
          { text: "Help clean up", affectionChange: 3, response: "Oh geez, thanks! Rick never helps with cleanup." },
          { text: "Suggest calling Rick", affectionChange: 1, response: "He's probably passed out somewhere..." },
          { text: "Document the damage", affectionChange: 2, response: "Good idea! Evidence for later." }
        ]
      }
    ];
    return scienceEvents[0];
  };

  const generateAdventureEvent = (characterName: string) => {
    const adventures = ['Cronenberg dimension', 'Squanch planet', 'Citadel of Ricks', 'Gazorpazorp', 'Bird Person realm'];
    const randomPlace = adventures[Math.floor(Math.random() * adventures.length)];
    
    return {
      title: "Interdimensional Alert!",
      description: `A portal opens nearby revealing ${randomPlace}. Something's coming through!`,
      icon: Star,
      choices: [
        { text: "Investigate portal", affectionChange: 2, response: characterName.includes('rick') ? "*burp* Bold move. Stupid, but bold." : "Oh no, should we really be doing this?" },
        { text: "Close the portal", affectionChange: 1, response: characterName.includes('rick') ? "*burp* Boring, but practical." : "Yeah, that's probably safer!" },
        { text: "Call for backup", affectionChange: 0, response: characterName.includes('rick') ? "*burp* What backup? We're on our own." : "Who would we even call?" }
      ]
    };
  };

  const generateDrinkingEvent = (characterName: string) => {
    return characterName.includes('rick') ? {
      title: "Liquid Courage",
      description: "Rick offers to share his mysterious flask contents with you.",
      icon: Skull,
      choices: [
        { text: "Take a sip", affectionChange: 4, response: "*burp* Holy shit! You actually did it! Respect." },
        { text: "Ask what's in it first", affectionChange: 2, response: "*burp* Smart. It's 40% alcohol, 60% science." },
        { text: "Politely decline", affectionChange: 1, response: "*burp* Your loss. More for me." }
      ]
    } : {
      title: "Rick's Drinking Problem",
      description: "Rick stumbles in completely wasted and Morty looks embarrassed.",
      icon: AlertTriangle,
      choices: [
        { text: "Help Morty deal with Rick", affectionChange: 3, response: "Thanks... this happens a lot." },
        { text: "Pretend not to notice", affectionChange: 1, response: "Yeah, that's... probably for the best." },
        { text: "Ask if this is normal", affectionChange: 2, response: "Unfortunately, yeah... this is Tuesday for us." }
      ]
    };
  };

  const generateFamilyEvent = (characterName: string) => {
    return {
      title: "Family Drama",
      description: characterName.includes('rick') ? 
        "Jerry calls Rick to complain about something mundane." :
        "Jerry starts bothering Morty about his grades again.",
      icon: AlertTriangle,
      choices: [
        { text: "Defend them", affectionChange: 3, response: characterName.includes('rick') ? "*burp* Thanks, but I can handle Jerry myself." : "Thanks for standing up for me!" },
        { text: "Stay out of it", affectionChange: 1, response: characterName.includes('rick') ? "*burp* Smart. Family drama is a black hole." : "Yeah, probably better not to get involved..." },
        { text: "Change the subject", affectionChange: 2, response: characterName.includes('rick') ? "*burp* Good thinking. Let's talk about literally anything else." : "Oh thank god, yes please!" }
      ]
    };
  };

  const generateRandomSituationEvent = (characterName: string) => {
    const situations = [
      "alien invasion alert", "reality glitch detected", "time loop warning", 
      "dimension merge detected", "galactic federation scanner"
    ];
    const situation = situations[Math.floor(Math.random() * situations.length)];
    
    return {
      title: "Unexpected Situation",
      description: `Suddenly, a ${situation} starts blaring throughout the house!`,
      icon: Sparkles,
      choices: [
        { text: "Take charge", affectionChange: 2, response: characterName.includes('rick') ? "*burp* Look at you being all leadership-y." : "Wow, okay, you're braver than me!" },
        { text: "Follow their lead", affectionChange: 1, response: characterName.includes('rick') ? "*burp* Smart. I know what I'm doing." : "I... I don't really know what to do either..." },
        { text: "Suggest hiding", affectionChange: 0, response: characterName.includes('rick') ? "*burp* Coward. But alive coward." : "That... might actually be the smart play here." }
      ]
    };
  };

  const triggerContextualEvent = () => {
    if (!character) return;
    
    const contextualEvent = generateContextualEvent();
    if (contextualEvent) {
      setCurrentEvent(contextualEvent);
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