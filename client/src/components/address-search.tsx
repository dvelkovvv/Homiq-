import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { geocodeAddress } from "@/lib/geocoding";
import { toast } from "@/hooks/use-toast";

interface AddressSearchProps {
  onLocationFound: (location: { lat: number; lng: number; display_name: string }) => void;
  defaultAddress?: string;
}

export function AddressSearch({ onLocationFound, defaultAddress = "" }: AddressSearchProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!address.trim()) {
      toast({
        title: "Въведете адрес",
        description: "Моля, въведете адрес за търсене.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await geocodeAddress(address);
      if (result) {
        onLocationFound({
          lat: result.lat,
          lng: result.lng,
          display_name: result.display_name
        });
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
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Въведете адрес..."
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        className="flex-1"
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
  );
}
