import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { GoogleMaps } from "./google-maps";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface AddressSearchProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onContinue?: () => void;
}

export function AddressSearch({ onLocationSelect, onContinue }: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Въведете адрес",
        description: "Моля, въведете адрес за търсене",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await api.get('api/geocode', {
        params: {
          address: `${searchQuery}, Bulgaria`
        }
      });

      if (!data.results?.[0]) {
        throw new Error('Адресът не е намерен');
      }

      const location = data.results[0].geometry.location;
      setSelectedLocation(location);
      onLocationSelect?.(location);

      toast({
        title: "Адресът е намерен",
        description: "Можете да коригирате позицията на маркера"
      });
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Грешка при търсене",
        description: error instanceof Error ? error.message : "Не успяхме да намерим адреса",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    onLocationSelect?.(location);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Въведете адрес..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="h-[400px] rounded-lg border overflow-hidden">
        <GoogleMaps
          onLocationSelect={handleLocationSelect}
          initialLocation={selectedLocation || undefined}
        />
      </div>

      {selectedLocation && onContinue && (
        <div className="flex justify-end">
          <Button onClick={onContinue}>
            Продължи
          </Button>
        </div>
      )}
    </div>
  );
}