import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { FileText, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { DocumentScanner } from "@/components/document-scanner";

const STEPS = [
  {
    title: "Основна информация",
    description: "Въведете детайли за имота"
  },
  {
    title: "Документи",
    description: "Качете документи"
  },
  {
    title: "Оценка",
    description: "Преглед на резултатите"
  }
];

interface DocumentStatus {
  notary_act: boolean;
  sketch: boolean;
  tax_assessment: boolean;
}

export default function Step2() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentsStatus, setDocumentsStatus] = useState<DocumentStatus>({
    notary_act: false,
    sketch: false,
    tax_assessment: false
  });

  const handleScanComplete = (text: string, data: any) => {
    if (data) {
      // Get existing property data
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');

      // Update documents array
      const documents = propertyData.documents || [];
      documents.push({
        type: data.documentType,
        extractedData: data,
        text: text,
        scannedAt: new Date().toISOString()
      });

      // Save updated data
      localStorage.setItem('propertyData', JSON.stringify({
        ...propertyData,
        documents
      }));

      // Update status
      if (data.documentType) {
        setDocumentsStatus(prev => ({
          ...prev,
          [data.documentType]: true
        }));
      }

      toast({
        title: "Документът е обработен успешно",
        description: "Данните са извлечени и запазени.",
      });
    }
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);
      localStorage.setItem('currentStep', '3');
      setLocation('/evaluation/step3');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при запазването на данните. Моля, опитайте отново.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
        <ProgressSteps currentStep={2} steps={STEPS} />

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Документи за имота
              </CardTitle>
              <CardDescription>
                Качете необходимите документи за оценка на имота
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 border rounded-lg ${documentsStatus.notary_act ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Нотариален акт</h4>
                    {documentsStatus.notary_act && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Документ за собственост</p>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="notary_act"
                  />
                </div>

                <div className={`p-4 border rounded-lg ${documentsStatus.sketch ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Скица</h4>
                    {documentsStatus.sketch && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Официален документ от кадастъра</p>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="sketch"
                  />
                </div>

                <div className={`p-4 border rounded-lg ${documentsStatus.tax_assessment ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Данъчна оценка</h4>
                    {documentsStatus.tax_assessment && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Актуална данъчна оценка</p>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="tax_assessment"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setLocation("/evaluation/step1")}>
              Назад
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-[#003366] hover:bg-[#002244]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Обработка..." : "Продължи"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}