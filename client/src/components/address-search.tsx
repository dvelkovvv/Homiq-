import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, MapPin } from "lucide-react";
import { geocodeAddress } from "@/lib/geocoding";
import { toast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
        toast({
          title: "Адресът е намерен",
          description: "Местоположението е маркирано на картата.",
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
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(address)}
              className="flex-1"
            />
            <Button 
              onClick={() => handleSearch(address)}
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Търсене на адрес..." value={address} onValueChange={setAddress} />
            <CommandEmpty>Няма намерени адреси.</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion.display_name}
                  onSelect={() => {
                    setAddress(suggestion.display_name);
                    handleSearch(suggestion.display_name);
                  }}
                  className="flex items-center gap-2 py-3"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{suggestion.display_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}