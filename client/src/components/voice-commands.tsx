import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

export function VoiceCommands() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Вашият браузър не поддържа гласови команди');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'bg-BG';

    recognition.onstart = () => {
      toast({
        title: "Гласови команди активирани",
        description: "Опитайте да кажете 'започни оценка' или 'оцени имот'",
      });
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        toast({
          title: "Не беше засечена реч",
          description: "Моля, опитайте отново",
          variant: "destructive"
        });
      } else {
        setError(`Грешка: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();

      if (command.includes('оцени') || command.includes('започни')) {
        toast({
          title: "Команда разпозната",
          description: "Пренасочване към оценка на имот",
        });
        navigate('/evaluation/step1');
      } else {
        toast({
          title: "Неразпозната команда",
          description: "Опитайте: 'започни оценка' или 'оцени имот'",
          variant: "destructive"
        });
      }
    };

    if (isListening && !error) {
      try {
        recognition.start();
      } catch (err) {
        setError('Грешка при стартиране на гласово разпознаване');
      }
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, navigate]);

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          if (!error) {
            setIsListening(!isListening);
          }
        }}
        className={`
          ${isListening ? "bg-primary text-primary-foreground" : ""}
          ${error ? "cursor-not-allowed opacity-50" : ""}
        `}
        title={error || (isListening ? "Изключи гласови команди" : "Включи гласови команди")}
      >
        {isListening ? (
          <Mic className="h-4 w-4 animate-pulse" />
        ) : (
          <MicOff className="h-4 w-4" />
        )}
      </Button>
      {error && (
        <div className="absolute bottom-full mb-2 whitespace-nowrap bg-destructive text-destructive-foreground text-xs rounded px-2 py-1">
          {error}
        </div>
      )}
    </div>
  );
}