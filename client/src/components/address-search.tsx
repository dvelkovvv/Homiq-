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
  onAddressChange?: (address: string) => void;
}

interface Prediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export function AddressSearch({ onLocationFound, defaultAddress = "", onAddressChange }: AddressSearchProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (window.google && !autocompleteService) {
      setAutocompleteService(new google.maps.places.AutocompleteService());
    }
  }, []);

  useEffect(() => {
    if (!defaultAddress) {
      try {
        const savedAddress = localStorage.getItem('lastAddress');
        if (savedAddress) {
          setAddress(savedAddress);
          onAddressChange?.(savedAddress);
        }
      } catch (error) {
        console.error('Error reading address from localStorage:', error);
      }
    }
  }, [defaultAddress, onAddressChange]);

  useEffect(() => {
    if (!address.trim() || !autocompleteService) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    const fetchPredictions = async () => {
      try {
        const result = await autocompleteService.getPlacePredictions({
          input: address,
          componentRestrictions: { country: 'bg' },
          types: ['address'],
          language: 'bg'
        });

        setPredictions(result.predictions);
        setOpen(result.predictions.length > 0);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredictions([]);
        setOpen(false);
      }
    };

    const timeoutId = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(timeoutId);
  }, [address, autocompleteService]);

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
        onAddressChange?.(result.display_name);

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

  const handleAddressSelect = (prediction: Prediction) => {
    setAddress(prediction.description);
    onAddressChange?.(prediction.description);
    handleSearch(prediction.description);
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
                const newAddress = e.target.value;
                setAddress(newAddress);
                onAddressChange?.(newAddress);
                setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !open) {
                  e.preventDefault();
                  handleSearch(address);
                }
              }}
              className={`flex-1 transition-colors ${
                predictions.length > 0 ? 'border-primary' : ''
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
                {predictions.map((prediction) => (
                  <motion.div
                    key={prediction.place_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.05 }
                    }}
                  >
                    <CommandItem
                      onSelect={() => handleAddressSelect(prediction)}
                      className="flex items-center gap-2 py-3 cursor-pointer hover:bg-accent"
                    >
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-medium">{prediction.structured_formatting.main_text}</span>
                        <span className="text-sm text-muted-foreground">{prediction.structured_formatting.secondary_text}</span>
                      </div>
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