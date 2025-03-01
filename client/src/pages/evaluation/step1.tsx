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
import { HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";


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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      address: "",
      area: 0,
      location: {
        lat: 42.6977,
        lng: 23.3219
      }
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (!addressValidated) {
        toast({
          title: "Невалиден адрес",
          description: "Моля, изберете адрес от картата",
          variant: "destructive"
        });
        return;
      }

      setIsSubmitting(true);

      // Save form data to localStorage
      localStorage.setItem('propertyData', JSON.stringify(data));
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

        <div className="mt-8 max-w-2xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Адрес на имота</FormLabel>
                    <AddressSearch
                      onLocationSelect={(location) => {
                        form.setValue('location', location);
                        setAddressValidated(true);
                      }}
                      onContinue={() => form.handleSubmit(onSubmit)()}
                    />
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
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Link href="/">
                  <Button variant="outline">
                    Назад
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting || !addressValidated}
                >
                  Продължи
                </Button>
              </div>
            </form>
          </Form>
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