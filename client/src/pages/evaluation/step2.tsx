import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { HelpCircle } from "lucide-react";
import { ProgressSteps } from "@/components/progress-steps";

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

export default function Step2() {
  const [, navigate] = useLocation();
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
    }
  }, [propertyId, navigate]);

  const handleContinue = () => {
    navigate(`/evaluation/step3?propertyId=${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={2} steps={STEPS} />

        <div className="mt-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Качване на документи</CardTitle>
              <CardDescription>
                Качете документи за вашия имот за по-точна оценка
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                Тази функционалност е временно изключена
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/evaluation/step1")}>
                Назад
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-[#003366] hover:bg-[#002244]"
              >
                Продължи към оценка
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}