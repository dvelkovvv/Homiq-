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
}

export function AddressSearch({ onLocationFound, defaultAddress = "" }: AddressSearchProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (address.trim().length < 3) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=bg&limit=5`
        );

        if (!response.ok) throw new Error('Failed to fetch suggestions');

        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
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
        setSelectedItem(result.display_name);

        // Success animation
        toast({
          title: "Адресът е намерен",
          description: (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-green-500" />
              <span>Местоположението е маркирано на картата</span>
            </motion.div>
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
                setSelectedItem(null);
                setOpen(true);
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(address)}
              className={`flex-1 transition-all ${
                selectedItem ? 'border-green-500 focus:ring-green-500/20' : ''
              }`}
            />
            <Button 
              onClick={() => handleSearch(address)}
              disabled={isSearching}
              className={`transition-all ${
                isSearching ? 'bg-primary/80' : ''
              }`}
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
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.display_name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.05 }
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