import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Search, MapPin, Loader2 } from "lucide-react";
import axios from 'axios';

interface LocationAnalysis {
  metro: { name: string; distance: number } | null;
  parks: number;
  schools: number;
  hospitals: number;
  coordinates: { lat: number; lng: number };
  formatted_address: string;
}

export function AddressSearch() {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [analysis, setAnalysis] = useState<LocationAnalysis | null>(null);

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
      const { data } = await axios.get('/api/search-location', {
        params: { address }
      });

      setAnalysis(data.analysis);
      toast({
        title: "Анализът е готов",
        description: "Успешно анализирахме локацията"
      });
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "Грешка при търсене",
        description: "Не успяхме да анализираме адреса",
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

      {analysis && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Намерен адрес</h3>
                <p className="text-sm text-muted-foreground">{analysis.formatted_address}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {analysis.metro && (
                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Метро станция</h4>
                  <p className="text-sm">{analysis.metro.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(analysis.metro.distance)}м разстояние
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2">Инфраструктура наблизо</h4>
                <ul className="text-sm space-y-1">
                  <li>Паркове: {analysis.parks}</li>
                  <li>Училища: {analysis.schools}</li>
                  <li>Болници: {analysis.hospitals}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}