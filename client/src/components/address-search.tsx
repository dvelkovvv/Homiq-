import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, MapPin, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { LocationAnalysis } from "./location-analysis";
import { geocodeAddress } from "@/lib/geocoding";

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
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [placesService, setPlacesService] = useState<google.maps.places.AutocompleteService | null>(null);

  // Initialize Google services
  useEffect(() => {
    if (window.google && !placesService) {
      setPlacesService(new google.maps.places.AutocompleteService());
    }
  }, []);

  // Load saved address if exists
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

  // Handle address search with debouncing
  useEffect(() => {
    if (!address.trim() || !placesService) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const result = await placesService.getPlacePredictions({
          input: address,
          componentRestrictions: { country: 'bg' },
          types: ['address'],
          language: 'bg'
        });

        setPredictions(result.predictions);
        setOpen(result.predictions.length > 0);
      } catch (error) {
        console.error('Error getting predictions:', error);
        setPredictions([]);
        setOpen(false);
        toast({
          title: "Грешка при търсене",
          description: "Моля, проверете въведения адрес",
          variant: "destructive"
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [address, placesService]);

  const handleAddressSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    setIsSearching(true);
    setIsValidated(false);

    try {
      const location = await geocodeAddress(prediction.description);

      if (location) {
        setAddress(location.display_name);
        onLocationFound(location);
        onAddressChange?.(location.display_name);
        setIsValidated(true);
        setOpen(false);

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
      }
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
      <div className="relative">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Input
                placeholder="Въведете адрес..."
                value={address}
                onChange={(e) => {
                  const newAddress = e.target.value;
                  setAddress(newAddress);
                  setIsValidated(false);
                  onAddressChange?.(newAddress);
                  if (newAddress.trim()) {
                    setOpen(true);
                  }
                }}
                className={`pr-10 ${isValidated ? 'border-green-500' : predictions.length > 0 ? 'border-primary' : ''}`}
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
            className="p-0 w-[calc(100vw-2rem)] sm:w-[500px]" 
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <Command>
              <CommandInput 
                placeholder="Търсене на адрес..." 
                value={address}
                onValueChange={(value) => {
                  setAddress(value);
                  setIsValidated(false);
                  if (value.trim()) {
                    setOpen(true);
                  }
                }}
                className="border-none focus:ring-0"
              />
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                Няма намерени адреси
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

      {isValidated && address && (
        <LocationAnalysis 
          address={address}
          onComplete={(analysis) => {
            // Save analysis data for later use in evaluation
            localStorage.setItem('locationAnalysis', JSON.stringify(analysis));
          }}
        />
      )}
    </div>
  );
}