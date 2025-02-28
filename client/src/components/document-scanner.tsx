import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DataComparison } from "@/lib/dataComparison";

interface DocumentScannerProps {
  onScanComplete: (text: string, data: any) => void;
  expectedType?: 'notary_act' | 'sketch' | 'tax_assessment';
}

export function DocumentScanner({ onScanComplete, expectedType }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setScanning(true);
      setProgress(0);
      setCurrentStep('Подготовка на документа');

      try {
        const worker = await createWorker({
          logger: progress => {
            if (progress.status === 'loading tesseract core') {
              setCurrentStep('Зареждане на OCR модула');
              setProgress(20);
            } else if (progress.status === 'initializing api') {
              setCurrentStep('Инициализация');
              setProgress(40);
            } else if (progress.status === 'recognizing text') {
              setCurrentStep('Разпознаване на текст');
              setProgress(60);
            }
          }
        });

        setCurrentStep('Зареждане на български език');
        await worker.loadLanguage('bul');
        await worker.initialize('bul');
        setProgress(70);

        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();

        if (text.trim().length > 0) {
          const extractedData = DataComparison.extractDataFromDocument(text);

          if (expectedType) {
            extractedData.documentType = expectedType;
          }

          onScanComplete(text, extractedData);

          toast({
            title: "Успешно сканиране",
            description: "Документът е обработен успешно.",
          });
        } else {
          throw new Error("Не беше открит текст в документа");
        }
      } catch (error) {
        console.error('OCR Error:', error);
        toast({
          title: "Грешка при сканиране",
          description: error instanceof Error ? error.message : "Моля, опитайте с друг документ.",
          variant: "destructive"
        });
      } finally {
        setScanning(false);
        setProgress(0);
        setCurrentStep('');
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
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
              Поддържани формати: PNG, JPG, PDF
            </p>
          </div>
        </div>
      )}
    </div>
  );
}