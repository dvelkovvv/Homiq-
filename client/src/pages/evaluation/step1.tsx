import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { GoogleMaps } from "@/components/google-maps";
import { EvaluationFormLayout } from "@/components/evaluation-form-layout";
import { NumericFormat } from "react-number-format";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Step1() {
  const [, navigate] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      address: "",
      type: undefined,
      squareMeters: 1,
      yearBuilt: undefined,
      location: {
        lat: 42.6977,
        lng: 23.3219
      },
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const formattedData = {
        ...data,
        yearBuilt: data.yearBuilt ? new Date(data.yearBuilt) : new Date(),
        location: data.location || { lat: 42.6977, lng: 23.3219 },
        rooms: 1,
        floor: 0,
        totalFloors: 1,
        heating: "electric",
        parking: false
      };

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
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
                    <NumericFormat
                      customInput={Input}
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values.floatValue || 1);
                      }}
                      thousandSeparator=" "
                      decimalScale={2}
                      allowNegative={false}
                      min={1}
                      placeholder="Въведете площ"
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
                <FormItem className="flex flex-col">
                  <FormLabel>Година на строеж</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-white",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd MMMM yyyy", { locale: bg })
                          ) : (
                            "Изберете дата"
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date(1800, 0, 1)
                        }
                        initialFocus
                        locale={bg}
                        captionLayout="dropdown-buttons"
                        fromYear={1800}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
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