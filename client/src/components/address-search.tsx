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

export function AddressSearch({ onLocationFound, defaultAddress = "", onAddressChange }: AddressSearchProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [placesService, setPlacesService] = useState<google.maps.places.AutocompleteService | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    // Initialize Google services
    if (window.google && !placesService) {
      setPlacesService(new google.maps.places.AutocompleteService());
      setGeocoder(new google.maps.Geocoder());
    }
  }, []);

  useEffect(() => {
    if (!defaultAddress) {
      const savedAddress = localStorage.getItem('lastAddress');
      if (savedAddress) {
        setAddress(savedAddress);
        onAddressChange?.(savedAddress);
      }
    }
  }, [defaultAddress, onAddressChange]);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!address.trim() || !placesService) {
      setPredictions([]);
      setOpen(false);
      return;
    }

    const newTimeout = setTimeout(async () => {
      try {
        const request: google.maps.places.AutocompletionRequest = {
          input: address,
          componentRestrictions: { country: 'bg' },
          types: ['address'],
          language: 'bg'
        };

        const response = await placesService.getPlacePredictions(request);
        setPredictions(response.predictions);
        setOpen(response.predictions.length > 0);
      } catch (error) {
        console.error('Error getting predictions:', error);
        setPredictions([]);
        setOpen(false);
      }
    }, 300);

    setSearchTimeout(newTimeout);
    return () => clearTimeout(newTimeout);
  }, [address, placesService]);

  const handleAddressValidation = async (searchAddress: string) => {
    if (!searchAddress.trim()) {
      toast({
        title: "Въведете адрес",
        description: "Моля, въведете адрес за търсене",
        variant: "destructive"
      });
      return false;
    }

    setIsSearching(true);

    try {
      if (!geocoder) {
        throw new Error('Geocoder not initialized');
      }

      const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
        geocoder.geocode(
          { 
            address: searchAddress,
            componentRestrictions: { country: 'BG' }
          }, 
          (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
              resolve(results[0]);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          }
        );
      });

      const location = {
        lat: result.geometry.location.lat(),
        lng: result.geometry.location.lng(),
        display_name: result.formatted_address
      };

      onLocationFound(location);
      localStorage.setItem('lastAddress', location.display_name);
      onAddressChange?.(location.display_name);
      setOpen(false);

      toast({
        title: "Адресът е намерен",
        description: (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-green-500" />
            <span>Местоположението е маркирано на картата</span>
          </div>
        ),
      });

      return true;
    } catch (error) {
      console.error('Error validating address:', error);
      toast({
        title: "Грешка при търсене",
        description: "Не успяхме да намерим този адрес. Моля, опитайте отново.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  const handlePredictionSelect = async (prediction: google.maps.places.AutocompletePrediction) => {
    setAddress(prediction.description);
    const success = await handleAddressValidation(prediction.description);
    if (success) {
      onAddressChange?.(prediction.description);
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
                const newAddress = e.target.value;
                setAddress(newAddress);
                onAddressChange?.(newAddress);
                if (newAddress.trim()) {
                  setOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !open) {
                  e.preventDefault();
                  handleAddressValidation(address);
                }
              }}
              className={`flex-1 transition-colors ${
                predictions.length > 0 ? 'border-primary' : ''
              }`}
            />
            <Button 
              onClick={() => handleAddressValidation(address)}
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
                      onSelect={() => handlePredictionSelect(prediction)}
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