import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, MapPin, CheckCircle } from "lucide-react";
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
  const [isSearching, setIsSearching] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{
    place_id: string;
    description: string;
    main_text: string;
    secondary_text: string;
  }>>([]);

  // Load saved address on mount
  useEffect(() => {
    if (!defaultAddress) {
      const savedAddress = localStorage.getItem('lastAddress');
      if (savedAddress) {
        setAddress(savedAddress);
        setIsValidated(true);
        onAddressChange?.(savedAddress);
      }
    }
  }, [defaultAddress, onAddressChange]);

  const handleAddressChange = (value: string) => {
    setAddress(value);
    setIsValidated(false);
    onAddressChange?.(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setIsSearching(true);

    // Set new timeout for search
    const newTimeout = setTimeout(async () => {
      try {
        // Mock API call - replace with real API in production
        const mockSuggestions = [
          {
            place_id: '1',
            description: value + ', София',
            main_text: value,
            secondary_text: 'София'
          },
          {
            place_id: '2',
            description: value + ', Пловдив',
            main_text: value,
            secondary_text: 'Пловдив'
          }
        ];

        setSuggestions(mockSuggestions);
        setOpen(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        toast({
          title: "Грешка при търсене",
          description: "Моля, опитайте отново",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    }, 300);

    setSearchTimeout(newTimeout);
  };

  const handleAddressSelect = async (suggestion: typeof suggestions[0]) => {
    setIsSearching(true);
    setIsValidated(false);

    try {
      // Mock geocoding - replace with real geocoding in production
      const location = {
        lat: 42.6977,
        lng: 23.3219,
        display_name: suggestion.description
      };

      setAddress(location.display_name);
      onLocationFound(location);
      onAddressChange?.(location.display_name);
      setOpen(false);
      setIsValidated(true);

      // Save for later use
      localStorage.setItem('lastAddress', location.display_name);
      localStorage.setItem('lastLocation', JSON.stringify({
        lat: location.lat,
        lng: location.lng
      }));

      toast({
        title: "Адресът е избран",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Адресът е успешно валидиран</span>
          </div>
        ),
      });
    } catch (error) {
      console.error('Error validating address:', error);
      toast({
        title: "Грешка при валидация",
        description: "Моля, опитайте с друг адрес",
        variant: "destructive"
      });
      setIsValidated(false);
    } finally {
      setIsSearching(false);
    }
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
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : isValidated ? (
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
          sideOffset={4}
        >
          <Command>
            <CommandInput 
              placeholder="Търсене на адрес..." 
              value={address}
              onValueChange={handleAddressChange}
            />
            <CommandEmpty className="py-6 text-center text-sm">
              {isSearching ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Търсене...</span>
                </div>
              ) : (
                'Няма намерени адреси'
              )}
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