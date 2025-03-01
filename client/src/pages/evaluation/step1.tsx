import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPropertySchema } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddressSearch } from "@/components/address-search";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { useState } from "react";
import { Link } from "wouter";
import { Logo } from "@/components/logo";
import { Building2, ArrowRight, HelpCircle, Home, MapPin, Hash, Store, Warehouse } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

const PROPERTY_TYPES = [
  {
    id: "residential",
    title: "Жилищен имот",
    description: "Апартаменти, къщи, вили",
    icon: Home
  },
  {
    id: "commercial",
    title: "Търговски имот",
    description: "Офиси, магазини, складове",
    icon: Store
  },
  {
    id: "agricultural",
    title: "Земеделска земя",
    description: "Ниви, пасища, градини",
    icon: Warehouse
  }
];

export default function Step1() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertyType, setPropertyType] = useState("residential");

  const form = useForm({
    defaultValues: {
      address: "",
      area: 0,
      propertyId: "",
      location: {
        lat: 42.6977,
        lng: 23.3219
      }
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      console.log('Form data:', data);

      localStorage.setItem('propertyData', JSON.stringify({
        ...data,
        propertyType
      }));
      localStorage.setItem('currentStep', '2');

      toast({
        title: "Успешно запазени данни",
        description: "Продължете към следващата стъпка",
      });

      navigate('/evaluation/step2');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при запазването на данните",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4 mb-12">
            <motion.h1 
              className="text-4xl font-bold text-gray-900"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Оценка на вашия имот
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Получете професионална оценка на вашия имот, базирана на реални пазарни данни
              и задълбочен анализ на локацията.
            </motion.p>
          </div>

          <div className="hidden sm:block">
            <ProgressSteps steps={STEPS} currentStep={1} />
          </div>

          <div className="grid md:grid-cols-[2fr,1fr] gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Тип на имота
                      </CardTitle>
                      <CardDescription>
                        Изберете категорията на вашия имот
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        value={propertyType}
                        onValueChange={setPropertyType}
                        className="grid gap-4 md:grid-cols-3"
                      >
                        {PROPERTY_TYPES.map(type => {
                          const Icon = type.icon;
                          return (
                            <label
                              key={type.id}
                              className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                propertyType === type.id
                                  ? 'border-primary bg-primary/5'
                                  : 'border-muted hover:border-primary/50'
                              }`}
                            >
                              <RadioGroupItem
                                value={type.id}
                                id={type.id}
                                className="sr-only"
                              />
                              <Icon className="h-8 w-8 mb-3 text-primary" />
                              <div className="text-center">
                                <p className="font-medium">{type.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {type.description}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Локация на имота
                      </CardTitle>
                      <CardDescription>
                        Въведете адрес или изберете локация от картата
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <AddressSearch
                              onLocationSelect={(location) => {
                                form.setValue('location', location);
                              }}
                              onContinue={() => form.handleSubmit(onSubmit)()}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" />
                        Детайли за имота
                      </CardTitle>
                      <CardDescription>
                        Въведете основна информация за имота
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="propertyId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Идентификационен номер</FormLabel>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                placeholder="Въведете идентификационен номер"
                                className="pl-9 max-w-md"
                              />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Площ (кв.м)</FormLabel>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Въведете площ"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="max-w-md"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Link href="/">
                      <Button variant="outline" className="gap-2">
                        Назад
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary hover:bg-primary/90 gap-2"
                    >
                      Продължи
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Как работи оценката?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-primary/10 text-sm font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Изберете тип имот</p>
                        <p className="text-sm text-muted-foreground">
                          Посочете категорията на вашия имот
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-primary/10 text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Въведете адрес</p>
                        <p className="text-sm text-muted-foreground">
                          Изберете точната локация на вашия имот
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-primary/10 text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Добавете детайли</p>
                        <p className="text-sm text-muted-foreground">
                          Попълнете основната информация за имота
                        </p>
                      </div>
                    </li>
                    </ul>
                </CardContent>
              </Card>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    Нужда от помощ?
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Как да попълните формата?</DialogTitle>
                  <DialogDescription>
                    <ul className="space-y-2 mt-2">
                      <li>1. Изберете типа на вашия имот от предложените категории</li>
                      <li>2. Въведете адрес или използвайте картата за избор на локация</li>
                      <li>3. Проверете дали адресът е правилно разпознат</li>
                      <li>4. Попълнете идентификационния номер на имота</li>
                      <li>5. Въведете площта на имота</li>
                      <li>6. Натиснете "Продължи" за следваща стъпка</li>
                    </ul>
                  </DialogDescription>
                </DialogContent>
              </Dialog>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}