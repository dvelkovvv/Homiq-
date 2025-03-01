import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Search, MapPin, Loader2, Building2 } from "lucide-react";
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
  const [analysis, setAnalysis] = useState<any>(null);

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
      const { data } = await axios.get('/api/geocode', {
        params: { address }
      });

      if (!data.results?.[0]) {
        throw new Error('Адресът не е намерен');
      }

      const location = data.results[0].geometry.location;
      setSelectedLocation(location);
      setAnalysis(data.analysis);
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
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
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

      {analysis && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Намерен адрес</h3>
                <p className="text-sm text-muted-foreground">{analysis.address}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {analysis.nearby.metro && (
                <div className="p-4 rounded-lg border">
                  <Building2 className="h-5 w-5 text-primary mb-2" />
                  <h4 className="font-medium">Метро станция</h4>
                  <p className="text-sm text-muted-foreground">
                    {analysis.nearby.metro.name}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg border">
                <h4 className="font-medium">Паркове наблизо</h4>
                <p className="text-2xl font-bold">{analysis.nearby.parks}</p>
              </div>

              <div className="p-4 rounded-lg border">
                <h4 className="font-medium">Училища наблизо</h4>
                <p className="text-2xl font-bold">{analysis.nearby.schools}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedLocation && (
        <div className="flex justify-end">
          <Button 
            onClick={() => onContinue?.()}
            className="bg-primary hover:bg-primary/90"
          >
            Продължи
          </Button>
        </div>
      )}
    </div>
  );
}