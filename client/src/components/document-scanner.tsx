import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DataComparison } from "@/lib/dataComparison";

interface DocumentScannerProps {
  onScanComplete: (text: string, data: any) => void;
  expectedType?: 'notary_act' | 'sketch' | 'tax_assessment';
}

export function DocumentScanner({ onScanComplete, expectedType }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any>(null);

  const handleAutofill = () => {
    if (extractedData) {
      DataComparison.autofillFormData(extractedData);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setScanning(true);
      setProgress(0);
      setCurrentStep('Подготовка на документа');

      try {
        const worker = await createWorker();

        setCurrentStep('Зареждане на български език');
        await worker.loadLanguage('bul');
        await worker.initialize('bul');
        setProgress(40);

        setCurrentStep('Разпознаване на текст');
        const { data: { text } } = await worker.recognize(file);
        setProgress(70);

        await worker.terminate();

        if (text.trim().length === 0) {
          throw new Error("Не беше открит текст в документа");
        }

        const processedText = text
          .trim()
          .replace(/\s+/g, ' ')
          .replace(/[^\wабвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ\s.,\-_()№]/g, '')
          .trim();

        setCurrentStep('Анализ на данни');
        const data = DataComparison.extractDataFromDocument(processedText);

        if (expectedType) {
          data.documentType = expectedType;
        }

        setExtractedData(data);
        setProgress(100);
        onScanComplete(processedText, data);

        toast({
          title: "Успешно сканиране",
          description: "Документът е обработен успешно. " + 
            (data.squareMeters ? `Площ: ${data.squareMeters} кв.м. ` : '') +
            (data.address ? `Адрес: ${data.address}` : '')
        });

      } catch (error) {
        console.error('OCR Error:', error);
        toast({
          title: "Грешка при сканиране",
          description: error instanceof Error 
            ? error.message 
            : "Моля, опитайте с друг документ или проверете качеството на изображението.",
          variant: "destructive"
        });
      } finally {
        setScanning(false);
        setProgress(0);
        setCurrentStep('');
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
          ${scanning ? 'pointer-events-none opacity-50' : 'hover:border-primary hover:bg-primary/5'}
        `}
      >
        <input {...getInputProps()} />
        {scanning ? (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">{currentStep}</p>
              <p className="text-sm text-muted-foreground">Моля, изчакайте</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <div className="space-y-4">
            <FileText className="h-8 w-8 mx-auto text-primary" />
            <div>
              <p className="font-medium">
                {isDragActive ? "Пуснете документа тук" : "Качете или плъзнете документ"}
              </p>
              <p className="text-sm text-muted-foreground">
                Поддържани формати: PNG, JPG (ясни копии на документи)
              </p>
            </div>
          </div>
        )}
      </div>

      {extractedData && !scanning && (
        <Button 
          onClick={handleAutofill}
          className="w-full bg-primary hover:bg-primary/90"
        >
          Попълни формата автоматично
        </Button>
      )}
    </div>
  );
}