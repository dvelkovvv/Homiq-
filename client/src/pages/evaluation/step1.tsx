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
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Home, Building2, Warehouse, Trees, Factory, Info, HelpCircle } from "lucide-react";
import { ProgressSteps } from "@/components/progress-steps";
import { useCallback, useEffect } from "react";
import { debounce } from "lodash";
import { Logo } from "@/components/logo";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { InstructionCard } from "@/components/instruction-card";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

const propertyTypeIcons = {
  apartment: Building2,
  house: Home,
  villa: Warehouse,
  agricultural: Trees,
  industrial: Factory,
};

const propertyTypeLabels = {
  apartment: "Апартамент",
  house: "Къща",
  villa: "Вила",
  agricultural: "Земеделска земя",
  industrial: "Индустриален имот",
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
  const [, setLocation] = useLocation();

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      type: undefined,
      address: "",
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
      // Store form data in localStorage
      const formData = {
        ...data,
        submittedAt: new Date().toISOString()
      };

      localStorage.setItem('propertyData', JSON.stringify(formData));

      toast({
        title: "Успешно запазени данни",
        description: "Продължете към следващата стъпка за качване на снимки и документи.",
      });

      // Use wouter's navigation
      setLocation('/evaluation/step2');

      // Add a fallback navigation after a short delay if the first attempt fails
      setTimeout(() => {
        if (window.location.pathname !== '/evaluation/step2') {
          console.log('Fallback navigation triggered');
          window.location.href = '/evaluation/step2';
        }
      }, 100);
    } catch (error: any) {
      console.error('Navigation error:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при навигацията. Моля, опитайте отново.",
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

  useUnsavedChanges(Object.keys(form.formState.dirtyFields).length > 0);

  const propertyType = form.watch("type");

  const showFields = useMemo(() => {
    switch (propertyType) {
      case "apartment":
        return {
          rooms: true,
          floor: true,
          totalFloors: true,
          heating: true,
          parking: true,
          yearBuilt: true,
          industrial: false
        };
      case "house":
        return {
          rooms: true,
          totalFloors: true,
          heating: true,
          parking: true,
          yearBuilt: true,
          industrial: false
        };
      case "villa":
        return {
          rooms: true,
          heating: true,
          parking: true,
          yearBuilt: true,
          industrial: false
        };
      case "agricultural":
        return {
          rooms: false,
          floor: false,
          totalFloors: false,
          heating: false,
          parking: false,
          yearBuilt: false,
          industrial: false
        };
      case "industrial":
        return {
          rooms: false,
          floor: false,
          totalFloors: true,
          heating: true,
          parking: true,
          yearBuilt: true,
          industrial: true
        };
      default:
        return {
          rooms: false,
          floor: false,
          totalFloors: false,
          heating: false,
          parking: false,
          yearBuilt: false,
          industrial: false
        };
    }
  }, [propertyType]);

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
                                <span className="text-sm font-medium">
                                  {propertyTypeLabels[value]}
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

                    {showFields.yearBuilt && (
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
                    )}
                  </div>
                </Card>

                {(showFields.rooms || showFields.floor || showFields.totalFloors) && (
                  <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {showFields.rooms && (
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
                      )}

                      {showFields.floor && (
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
                      )}

                      {showFields.totalFloors && (
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
                      )}
                    </div>

                    {(showFields.heating || showFields.parking) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {showFields.heating && (
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
                        )}

                        {showFields.parking && (
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
                        )}
                      </div>
                    )}
                  </Card>
                )}

                {showFields.industrial && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Индустриални характеристики</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="productionArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Производствена площ (кв.м)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
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
                        name="storageArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Складова площ (кв.м)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
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
                        name="ceilingHeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Височина на помещенията (м)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Въведете височина"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                className="bg-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="loadingDock"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Товарен достъп</FormLabel>
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

                        <FormField
                          control={form.control}
                          name="threePhasePower"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Трифазен ток</FormLabel>
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
                    </div>
                  </Card>
                )}

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

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setLocation("/")}>
                    Назад
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#003366] hover:bg-[#002244]"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Spinner className="mr-2" />
                        Обработка...
                      </>
                    ) : (
                      'Продължи напред'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
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