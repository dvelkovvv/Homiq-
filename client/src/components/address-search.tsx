import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";
import { LocationAnalysis } from "./location-analysis";

interface AddressSearchProps {
  onLocationFound: (location: { lat: number; lng: number; display_name: string }) => void;
  defaultAddress?: string;
  onAddressChange?: (address: string) => void;
}

export function AddressSearch({ onLocationFound, defaultAddress = "", onAddressChange }: AddressSearchProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [isValidated, setIsValidated] = useState(false);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<{
    place_id: string;
    description: string;
    main_text: string;
    secondary_text: string;
  }>>([]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setIsValidated(false);
    onAddressChange?.(value);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    // Симулируем получение предложений (в реальном приложении здесь будет API запрос)
    const mockSuggestions = [
      {
        place_id: '1',
        description: 'София, бул. Витоша 89',
        main_text: 'бул. Витоша 89',
        secondary_text: 'София'
      },
      {
        place_id: '2',
        description: 'София, ул. Граф Игнатиев 15',
        main_text: 'ул. Граф Игнатиев 15',
        secondary_text: 'София'
      }
    ];

    setSuggestions(mockSuggestions);
    setOpen(true);
  };

  const handleAddressSelect = (suggestion: typeof suggestions[0]) => {
    setAddress(suggestion.description);
    setIsValidated(true);
    setOpen(false);

    // Симулируем получение координат (в реальном приложении здесь будет geocoding)
    const location = {
      lat: 42.6977,
      lng: 23.3219,
      display_name: suggestion.description
    };

    onLocationFound(location);
    onAddressChange?.(suggestion.description);

    // Сохраняем для последующего использования
    localStorage.setItem('lastAddress', suggestion.description);
    localStorage.setItem('lastLocation', JSON.stringify({ 
      lat: location.lat, 
      lng: location.lng 
    }));

    toast({
      title: "Адресът е избран",
      description: "Местоположението е успешно валидирано",
    });
  };

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              placeholder="Въведете адрес за търсене..."
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={`pr-10 ${isValidated ? 'border-green-500' : ''}`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValidated ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[calc(100vw-2rem)] sm:w-[400px]" 
          align="start"
        >
          <Command>
            <CommandInput 
              placeholder="Търсене на адрес..." 
              value={address}
              onValueChange={handleAddressChange}
            />
            <CommandEmpty className="py-6 text-center text-sm">
              Няма намерени адреси
            </CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.place_id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CommandItem
                    onSelect={() => handleAddressSelect(suggestion)}
                    className="flex items-center gap-2 py-3 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">{suggestion.main_text}</span>
                      <span className="text-sm text-muted-foreground">
                        {suggestion.secondary_text}
                      </span>
                    </div>
                  </CommandItem>
                </motion.div>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {isValidated && address && (
        <LocationAnalysis 
          address={address}
          onComplete={() => {
            toast({
              title: "Анализ завършен",
              description: "Можете да продължите към следващата стъпка",
            });
          }}
        />
      )}
    </div>
  );
}