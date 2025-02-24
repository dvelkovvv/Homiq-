import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleMaps } from "@/components/google-maps";
import { Logo } from "@/components/logo";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { bg } from "date-fns/locale";
import { NumericFormat } from "react-number-format";
import { toast } from "@/hooks/use-toast";

export default function Step1() {
  const [, navigate] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      address: "",
      type: undefined,
      squareMeters: 1,
      yearBuilt: undefined,
      location: null,
      photos: [],
      documents: []
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // Ensure yearBuilt is a proper Date object
      const formattedData = {
        ...data,
        yearBuilt: data.yearBuilt instanceof Date ? data.yearBuilt : new Date(data.yearBuilt),
        location: data.location || null,
        photos: [],
        documents: []
      };

      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create property');
      }

      const property = await response.json();
      navigate(`/evaluation/step2?propertyId=${property.id}`);
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при създаването на имота. Моля, опитайте отново.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Стъпка 1: Данни за имота</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <FormLabel>Дата на строеж</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal bg-white hover:bg-gray-50",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, 'dd MMMM yyyy', { locale: bg }) : "Изберете дата"}
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
                            ISOWeek
                            fixedWeeks
                            formatters={{
                              formatCaption: (date) => {
                                return format(date, 'MMMM yyyy', { locale: bg });
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Местоположение</FormLabel>
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

                <CardFooter className="px-0 pt-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#003366] hover:bg-[#002244]"
                  >
                    Продължи към стъпка 2
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}