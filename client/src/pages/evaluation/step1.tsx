import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GoogleMaps } from "@/components/google-maps";
import { EvaluationFormLayout } from "@/components/evaluation-form-layout";
import { toast } from "@/hooks/use-toast";

export default function Step1() {
  const [, navigate] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      address: "",
      type: undefined,
      squareMeters: 1,
      yearBuilt: new Date().getFullYear(),
      location: {
        lat: 42.6977,
        lng: 23.3219
      },
      rooms: 1,
      floor: 0,
      totalFloors: 1,
      heating: "electric",
      parking: false
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Грешка при създаване на имота');
      }

      const property = await response.json();
      navigate(`/evaluation/step2?propertyId=${property.id}`);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Грешка",
        description: error.message || "Възникна проблем при създаването на имота. Моля, опитайте отново.",
        variant: "destructive"
      });
    }
  };

  return (
    <EvaluationFormLayout
      title="Основна информация за имота"
      onBack={() => navigate("/")}
      onNext={form.handleSubmit(onSubmit)}
      nextLabel="Продължи към следваща стъпка"
      isSubmitting={form.formState.isSubmitting}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип имот</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Изберете тип имот" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="apartment">Апартамент</SelectItem>
                    <SelectItem value="house">Къща</SelectItem>
                    <SelectItem value="villa">Вила</SelectItem>
                    <SelectItem value="agricultural">Земеделска земя</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Адрес</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Въведете адрес" 
                    {...field} 
                    className="bg-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="squareMeters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Площ (кв.м)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Въведете площ"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="yearBuilt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Година на строеж</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      placeholder="Въведете година"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="rooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Брой стаи</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Брой стаи"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Етаж</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="Етаж"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalFloors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Общо етажи</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Общо етажи"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      className="bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="heating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Отопление</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Изберете тип отопление" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="electric">Електричество</SelectItem>
                      <SelectItem value="gas">Газ</SelectItem>
                      <SelectItem value="other">Друго</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parking"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Паркомясто</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Местоположение на имота</FormLabel>
                <FormControl>
                  <GoogleMaps 
                    onLocationSelect={(location) => field.onChange(location)}
                    initialLocation={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </EvaluationFormLayout>
  );
}