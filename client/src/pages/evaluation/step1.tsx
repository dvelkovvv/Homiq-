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

export default function Step1() {
  const [, navigate] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      address: "",
      type: "",
      squareMeters: 1,
      yearBuilt: new Date().getFullYear(),
      location: undefined,
      photos: [],
      documents: []
    }
  });

  const onSubmit = async (data: any) => {
    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const property = await response.json();
      navigate(`/evaluation/step2?propertyId=${property.id}`);
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
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Тип имот</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormMessage className="text-red-500" />
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
                            field.onChange(Math.max(1, values.floatValue || 1));
                          }}
                          thousandSeparator=" "
                          decimalScale={2}
                          allowNegative={false}
                          min={1}
                          placeholder="Въведете площ"
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
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
                                "w-full pl-3 text-left font-normal bg-white hover:bg-gray-50",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value || "Изберете година"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(field.value, 0)}
                            onSelect={(date) => field.onChange(date?.getFullYear())}
                            disabled={(date) =>
                              date > new Date() || date < new Date(1800, 0)
                            }
                            initialFocus
                            locale={bg}
                            captionLayout="dropdown-buttons"
                            fromYear={1800}
                            toYear={new Date().getFullYear()}
                            showYearDropdown
                            yearDropdownItemNumber={200}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-red-500" />
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
                      <FormMessage className="text-red-500" />
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