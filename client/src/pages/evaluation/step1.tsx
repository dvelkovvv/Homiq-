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
import { Card } from "@/components/ui/card";
import { Home, Building2, Warehouse, Trees, Info, HelpCircle } from "lucide-react";
import { ProgressSteps } from "@/components/progress-steps";
import { useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { Logo } from "@/components/logo";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { InstructionCard } from "@/components/instruction-card";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

const propertyTypeIcons = {
  apartment: Building2,
  house: Home,
  villa: Warehouse,
  agricultural: Trees,
};

const STEPS = [
  {
    title: "Основна информация",
    description: "Въведете детайли за имота"
  },
  {
    title: "Медия файлове",
    description: "Качете снимки и документи"
  },
  {
    title: "Оценка",
    description: "Преглед на резултатите"
  }
];

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
      toast({
        title: "Успешно създаден имот",
        description: "Продължете към следващата стъпка за качване на снимки и документи.",
      });
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

  const saveFormData = useCallback(
    debounce((data: any) => {
      localStorage.setItem('propertyFormData', JSON.stringify(data));
    }, 1000),
    []
  );

  useEffect(() => {
    const savedData = localStorage.getItem('propertyFormData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      form.reset(parsedData);
    }
  }, []);

  useEffect(() => {
    const subscription = form.watch((data) => {
      if (Object.keys(form.formState.dirtyFields).length > 0) {
        saveFormData(data);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, saveFormData]);

  // Add unsaved changes warning
  useUnsavedChanges(Object.keys(form.formState.dirtyFields).length > 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={1} steps={STEPS} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <EvaluationFormLayout
              title="Основна информация за имота"
              description="Попълнете основните характеристики на вашия имот за точна оценка"
              onBack={() => navigate("/")}
              onNext={form.handleSubmit(onSubmit)}
              nextLabel="Продължи към следваща стъпка"
              isSubmitting={form.formState.isSubmitting}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card className="p-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тип имот</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(propertyTypeIcons).map(([value, Icon]) => (
                              <div
                                key={value}
                                className={`cursor-pointer p-4 rounded-lg border transition-all ${
                                  field.value === value
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => field.onChange(value)}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  <Icon className="h-6 w-6" />
                                  <span className="text-sm font-medium capitalize">
                                    {value === "apartment"
                                      ? "Апартамент"
                                      : value === "house"
                                      ? "Къща"
                                      : value === "villa"
                                      ? "Вила"
                                      : "Земеделска земя"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </Card>

                  <Card className="p-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                  </Card>

                  <Card className="p-6">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
                  </Card>

                  <Card className="p-6">
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
                  </Card>
                </form>
              </Form>
            </EvaluationFormLayout>
          </motion.div>

          <div className="hidden lg:block space-y-4">
            <InstructionCard
              icon={<Info className="h-5 w-5 text-blue-500" />}
              title="Как да попълните формата?"
              description="Следвайте стъпките внимателно и попълнете всички задължителни полета. Можете да запазите прогреса си по всяко време."
            />
            <InstructionCard
              icon={<HelpCircle className="h-5 w-5 text-green-500" />}
              title="Нуждаете се от помощ?"
              description="Ако имате въпроси относно попълването на формата, не се колебайте да се свържете с нас."
            />
          </div>
        </div>
      </main>

      {/* Mobile instruction modal */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 md:hidden rounded-full h-12 w-12 bg-primary shadow-lg"
            size="icon"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Как да попълните формата?</DialogTitle>
          <DialogDescription>
            Следвайте стъпките внимателно и попълнете всички задължителни полета.
            Можете да запазите прогреса си по всяко време.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}