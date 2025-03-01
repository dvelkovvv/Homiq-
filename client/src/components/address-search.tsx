import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { MapPin, Loader2, Building2, School, Hospital, PalmTree, CheckCircle, ArrowRight, Search } from "lucide-react";
import { GoogleMaps } from "./google-maps";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';

interface AddressSearchProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  onContinue?: () => void;
}

export function AddressSearch({ onLocationSelect, onContinue }: AddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [analysis, setAnalysis] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Въведете адрес или идентификационен номер",
        description: "Моля, въведете адрес или идентификационен номер за търсене",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      // First try to search by property ID
      if (searchQuery.match(/^\d+$/)) {
        const { data } = await axios.get(`/api/properties/${searchQuery}`);
        if (data) {
          setSelectedLocation(data.location);
          setSelectedAddress(data.address);
          await fetchLocationAnalysis(data.location);
          return;
        }
      }

      // If not found by ID or not a number, search by address
      const { data } = await axios.get('/api/geocode', {
        params: { address: searchQuery }
      });

      if (!data.results?.[0]) {
        throw new Error('Адресът не е намерен');
      }

      const location = data.results[0].geometry.location;
      setSelectedLocation(location);
      setSelectedAddress(data.results[0].formatted_address);
      setAnalysis(data.analysis);
      onLocationSelect?.(location);

      toast({
        title: "Адресът е намерен",
        description: "Можете да коригирате позицията на маркера",
      });

    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: "Грешка при търсене",
        description: error instanceof Error ? error.message : "Не успяхме да намерим имота",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const fetchLocationAnalysis = async (location: { lat: number; lng: number }) => {
    try {
      const { data } = await axios.get('/api/geocode', {
        params: { 
          latlng: `${location.lat},${location.lng}`,
          language: 'bg'
        }
      });

      setAnalysis(data.analysis);
      onLocationSelect?.(location);

      toast({
        title: "Локацията е анализирана",
        description: "Успешно анализирахме избраната локация",
      });
    } catch (error) {
      console.error('Error analyzing location:', error);
      toast({
        title: "Грешка при анализ",
        description: "Не успяхме да анализираме локацията",
        variant: "destructive"
      });
    }
  };

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    await fetchLocationAnalysis(location);
  };

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Въведете адрес или идентификационен номер..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pr-10"
          />
          {selectedLocation && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <CheckCircle className="h-5 w-5 text-green-500" />
            </motion.div>
          )}
        </div>
        <Button 
          onClick={handleSearch}
          disabled={isSearching}
          className="min-w-[120px]"
        >
          {isSearching ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Търсене...
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Търси
            </motion.div>
          )}
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden bg-white shadow-sm">
        <div className="h-[400px] relative">
          <GoogleMaps
            onLocationSelect={handleLocationSelect}
            onAddressSelect={handleAddressSelect}
            initialLocation={selectedLocation || undefined}
          />
          {isSearching && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm font-medium">Анализиране на локацията...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-start gap-3 mb-6"
                >
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Намерен адрес</h3>
                    <p className="text-sm text-muted-foreground">{selectedAddress}</p>
                  </div>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-4">
                  {analysis.nearby?.metro && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                    >
                      <Building2 className="h-5 w-5 text-primary mb-2" />
                      <h4 className="font-medium">Метро</h4>
                      <p className="text-sm text-muted-foreground">
                        {analysis.nearby.metro.name}
                      </p>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                  >
                    <PalmTree className="h-5 w-5 text-green-500 mb-2" />
                    <h4 className="font-medium">Паркове</h4>
                    <p className="text-2xl font-bold">{analysis.nearby?.parks}</p>
                    <p className="text-sm text-muted-foreground">в близост</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                  >
                    <School className="h-5 w-5 text-blue-500 mb-2" />
                    <h4 className="font-medium">Училища</h4>
                    <p className="text-2xl font-bold">{analysis.nearby?.schools}</p>
                    <p className="text-sm text-muted-foreground">в близост</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow"
                  >
                    <Hospital className="h-5 w-5 text-red-500 mb-2" />
                    <h4 className="font-medium">Болници</h4>
                    <p className="text-2xl font-bold">{analysis.nearby?.hospitals || 0}</p>
                    <p className="text-sm text-muted-foreground">в близост</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => onContinue?.()}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Продължи
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.div>
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}