import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";
import { GoogleMaps } from "./google-maps";
import axios from 'axios';

interface AddressSearchProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onContinue?: () => void;
}

export function AddressSearch({ onLocationSelect, onContinue }: AddressSearchProps) {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSearch = async () => {
    if (!address.trim()) {
      toast({
        title: "Въведете адрес",
        description: "Моля, въведете адрес за търсене",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for address:', address);
      const { data } = await axios.get('/api/geocode', {
        params: { address }
      });

      console.log('Got geocoding response:', data);

      if (!data.results?.[0]) {
        throw new Error('Адресът не е намерен');
      }

      const location = {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng
      };

      setSelectedLocation(location);
      onLocationSelect?.(location);

      toast({
        title: "Адресът е намерен",
        description: "Можете да коригирате позицията на маркера",
      });

    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "Грешка при търсене",
        description: error instanceof Error ? error.message : "Не успяхме да намерим адреса",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Въведете адрес..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Търсене...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Търси
            </>
          )}
        </Button>
      </div>

      <div className="h-[400px] rounded-lg border overflow-hidden">
        <GoogleMaps
          onLocationSelect={(location) => {
            setSelectedLocation(location);
            onLocationSelect?.(location);
          }}
          initialLocation={selectedLocation || undefined}
        />
      </div>

      {selectedLocation && (
        <div className="flex justify-end">
          <Button onClick={() => onContinue?.()}>
            Продължи
          </Button>
        </div>
      )}
    </div>
  );
}