import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

export function VoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'bg-BG';

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();

      if (command.includes('оцени') || command.includes('започни')) {
        navigate('/evaluation/step1');
      }
    };

    if (isListening) {
      recognition.start();
      toast({
        title: "Гласови команди активирани",
        description: "Опитайте да кажете 'започни оценка' или 'оцени имот'",
      });
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, navigate]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setIsListening(!isListening)}
      className={isListening ? "bg-primary text-primary-foreground" : ""}
      title={isListening ? "Изключи гласови команди" : "Включи гласови команди"}
    >
      {isListening ? (
        <Mic className="h-4 w-4" />
      ) : (
        <MicOff className="h-4 w-4" />
      )}
    </Button>
  );
}