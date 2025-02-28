import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin } from "lucide-react";
import { geocodeAddress } from "@/lib/geocoding";
import { toast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

interface AddressSearchProps {
  onLocationFound: (location: { lat: number; lng: number; display_name: string }) => void;
  defaultAddress?: string;
}

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string; // Added for unique keys
}

export function AddressSearch({ onLocationFound, defaultAddress = "" }: AddressSearchProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Sync with localStorage on mount
  useEffect(() => {
    if (!defaultAddress) {
      try {
        const savedAddress = localStorage.getItem('lastAddress');
        if (savedAddress) {
          setAddress(savedAddress);
          handleSearch(savedAddress); // Automatically search for saved address
        }
      } catch (error) {
        console.error('Error reading address from localStorage:', error);
      }
    }
  }, [defaultAddress]);

  // Fetch suggestions when address changes with debouncing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (address.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const newTimeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=bg&limit=5`
        );

        if (!response.ok) throw new Error('Failed to fetch suggestions');

        const data = await response.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        setOpen(false);
        toast({
          title: "Грешка при търсене",
          description: "Не успяхме да заредим предложения за адреси",
          variant: "destructive"
        });
      }
    }, 300); // Debounce delay

    setSearchTimeout(newTimeout);
    return () => {
      if (newTimeout) clearTimeout(newTimeout);
    };
  }, [address]);

  const handleSearch = async (searchAddress: string) => {
    if (!searchAddress.trim()) {
      toast({
        title: "Въведете адрес",
        description: "Моля, въведете адрес за търсене.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await geocodeAddress(searchAddress);
      if (result) {
        onLocationFound({
          lat: result.lat,
          lng: result.lng,
          display_name: result.display_name
        });
        setOpen(false);
        localStorage.setItem('lastAddress', result.display_name);

        toast({
          title: "Адресът е намерен",
          description: (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-500" />
              <span>Местоположението е маркирано на картата</span>
            </div>
          ),
        });
      }
    } catch (error) {
      console.error('Error searching address:', error);
      toast({
        title: "Грешка при търсене",
        description: "Не успяхме да намерим този адрес. Моля, опитайте отново.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex gap-2">
            <Input
              placeholder="Въведете адрес..."
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !open) {
                  e.preventDefault();
                  handleSearch(address);
                }
              }}
              className={`flex-1 transition-colors ${
                suggestions.length > 0 ? 'border-primary' : ''
              }`}
            />
            <Button 
              onClick={() => handleSearch(address)}
              disabled={isSearching}
              className="transition-all"
            >
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="search"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Search className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[calc(100vw-2rem)] sm:w-[500px]" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <Command>
            <CommandInput 
              placeholder="Търсене на адрес..." 
              value={address}
              onValueChange={setAddress}
              className="border-none focus:ring-0"
            />
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              Няма намерени адреси.
            </CommandEmpty>
            <CommandGroup>
              <AnimatePresence>
                {suggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.place_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.05 }
                    }}
                  >
                    <CommandItem
                      onSelect={() => {
                        setAddress(suggestion.display_name);
                        handleSearch(suggestion.display_name);
                      }}
                      className="flex items-center gap-2 py-3 cursor-pointer hover:bg-accent"
                    >
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{suggestion.display_name}</span>
                    </CommandItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}