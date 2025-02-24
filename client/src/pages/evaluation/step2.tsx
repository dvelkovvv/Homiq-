import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { HelpCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { DocumentScanner } from "@/components/document-scanner";
import { Info } from "lucide-react";
import { InstructionCard } from "@/components/instruction-card";
import { Spinner } from "@/components/ui/spinner";

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
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState<string>("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
    }
  }, [propertyId, navigate]);

  const handleScanComplete = (text: string, data: any) => {
    setIsScanning(false);
    setScannedText(text);
    setExtractedData(data);
    toast({
      title: "Документът е сканиран успешно",
      description: "Текстът е извлечен от документа.",
    });
  };

  const handleContinue = () => {
    const params = new URLSearchParams();
    params.set('propertyId', propertyId!);
    if (extractedData) {
      params.set('extractedData', JSON.stringify(extractedData));
    }
    navigate(`/evaluation/step3?${params.toString()}`);
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

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Качване на документи</CardTitle>
                <CardDescription>
                  Качете документи за вашия имот за по-точна оценка
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isScanning && (
                    <div className="flex items-center justify-center p-8">
                      <Spinner className="h-8 w-8" />
                      <span className="ml-3">Сканиране на документа...</span>
                    </div>
                  )}

                  <DocumentScanner 
                    onScanStart={() => setIsScanning(true)}
                    onScanComplete={handleScanComplete} 
                  />

                  {scannedText && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Извлечен текст и данни:</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{scannedText}</p>
                      {extractedData && (
                        <div className="mt-4 space-y-2">
                          {extractedData.squareMeters && (
                            <p className="text-sm">Квадратура: {extractedData.squareMeters} кв.м</p>
                          )}
                          {extractedData.constructionYear && (
                            <p className="text-sm">Година на строителство: {extractedData.constructionYear}</p>
                          )}
                          {extractedData.address && (
                            <p className="text-sm">Адрес: {extractedData.address}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/evaluation/step1")}>
                  Назад
                </Button>
                <Button
                  onClick={handleContinue}
                  className="bg-[#003366] hover:bg-[#002244]"
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <>
                      <Spinner className="mr-2" />
                      Обработка...
                    </>
                  ) : (
                    'Продължи към оценка'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="hidden lg:block space-y-4">
            <InstructionCard
              icon={<Info className="h-5 w-5 text-blue-500" />}
              title="Как да качите документи?"
              description="Изберете качествени снимки на документите. Системата автоматично ще анализира текста в документите."
            />
          </div>
        </div>
      </main>
    </div>
  );
}