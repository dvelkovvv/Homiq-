import { ReactNode } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

interface EvaluationFormLayoutProps {
  children: ReactNode;
  title: string;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isSubmitting?: boolean;
}

export function EvaluationFormLayout({
  children,
  title,
  onBack,
  onNext,
  nextLabel = "Продължи",
  isSubmitting = false
}: EvaluationFormLayoutProps) {
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
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          
          <CardContent>
            {children}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Назад
              </Button>
            )}
            {onNext && (
              <Button
                onClick={onNext}
                className="bg-[#003366] hover:bg-[#002244]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Обработка..." : nextLabel}
              </Button>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
