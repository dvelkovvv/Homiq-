import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentScannerProps {
  onScanComplete: (text: string, data: any) => void;
  expectedType?: 'notary_act' | 'sketch' | 'tax_assessment';
}

export function DocumentScanner({ onScanComplete, expectedType }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');

  const getDocumentTypeName = (type: string): string => {
    const types: Record<string, string> = {
      'notary_act': 'Нотариален акт',
      'sketch': 'Скица',
      'tax_assessment': 'Данъчна оценка'
    };
    return types[type] || 'Документ';
  };

  const validateImage = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Проверка за минимален размер
        if (img.width < 800 || img.height < 600) {
          toast({
            title: "Недостатъчна резолюция",
            description: "Моля, използвайте изображение с по-висока резолюция (минимум 800x600)",
            variant: "destructive"
          });
          resolve(false);
          return;
        }
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      // Проверка за размер на файла (максимум 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Твърде голям файл",
          description: "Моля, използвайте файл по-малък от 10MB",
          variant: "destructive"
        });
        return;
      }

      // Валидация на изображението
      if (!(await validateImage(file))) {
        return;
      }

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

        // Валидация на извлечения текст
        if (!text || text.trim().length < 50) {
          throw new Error("Не беше открит достатъчно текст в документа. Моля, проверете качеството на изображението.");
        }

        const data = {
          documentType: expectedType,
          text: text.trim()
        };

        onScanComplete(text.trim(), data);

        toast({
          title: "Успешно сканиране",
          description: "Документът е обработен успешно"
        });

      } catch (error) {
        console.error('OCR Error:', error);
        toast({
          title: "Грешка при сканиране",
          description: error instanceof Error 
            ? error.message 
            : "Възникна проблем при обработката на документа. Моля, проверете качеството на изображението и опитайте отново.",
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
              {isDragActive 
                ? "Пуснете документа тук" 
                : expectedType 
                  ? `Качете ${getDocumentTypeName(expectedType).toLowerCase()}`
                  : "Качете или плъзнете документ"}
            </p>
            <p className="text-sm text-muted-foreground">
              Поддържани формати: PNG, JPG (ясни копии на документи)
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Минимална резолюция: 800x600 | Максимален размер: 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}