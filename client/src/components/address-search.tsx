import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Search, MapPin, Loader2, School, Hospital, Tree } from "lucide-react";
import axios from 'axios';

interface Analysis {
  address: string;
  location: { lat: number; lng: number };
  metro: { name: string; distance: number } | null;
  parks: number;
  schools: number;
  hospitals: number;
}

interface SearchResponse {
  property_id: number;
  analysis: Analysis;
}

export function AddressSearch() {
  const [address, setAddress] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);

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
      const { data } = await axios.get<SearchResponse>('/api/search-location', {
        params: { address }
      });

      setResult(data);
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

      {result && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium">Намерен адрес</h3>
                <p className="text-sm text-muted-foreground">{result.analysis.address}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {result.analysis.metro && (
                <div className="p-4 rounded-lg border">
                  <h4 className="font-medium mb-2">Метро</h4>
                  <p className="text-sm">{result.analysis.metro.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.analysis.metro.distance}м разстояние
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Tree className="h-4 w-4" />
                  Паркове
                </h4>
                <p className="text-2xl font-bold">{result.analysis.parks}</p>
                <p className="text-sm text-muted-foreground">в радиус от 2км</p>
              </div>

              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Училища
                </h4>
                <p className="text-2xl font-bold">{result.analysis.schools}</p>
                <p className="text-sm text-muted-foreground">в радиус от 2км</p>
              </div>

              <div className="p-4 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Hospital className="h-4 w-4" />
                  Болници
                </h4>
                <p className="text-2xl font-bold">{result.analysis.hospitals}</p>
                <p className="text-sm text-muted-foreground">в радиус от 2км</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}