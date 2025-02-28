import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DocumentAnalyzer } from "@/lib/documentAnalyzer";
import { ImagePreprocessor } from "@/lib/imagePreprocessor";

interface DocumentScannerProps {
  onScanComplete: (text: string, data?: any) => void;
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
      'tax_assessment': 'Данъчна оценка',
      'other': 'Друг документ'
    };
    return types[type] || types.other;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setScanning(true);
      setProgress(0);
      setCurrentStep('Подготовка на документа');

      try {
        const file = acceptedFiles[0];
        const buffer = await file.arrayBuffer();

        // Preprocess image
        setCurrentStep('Обработка на изображението');
        const processedBuffer = await ImagePreprocessor.preprocessImage(buffer);
        const processedBlob = new Blob([processedBuffer], { type: 'image/png' });
        const imageUrl = URL.createObjectURL(processedBlob);
        setProgress(30);

        const worker = await createWorker({
          logger: progress => {
            if (progress.status === 'loading tesseract core') {
              setCurrentStep('Зареждане на OCR модула');
              setProgress(40);
            } else if (progress.status === 'initializing api') {
              setCurrentStep('Инициализация');
              setProgress(50);
            } else if (progress.status === 'recognizing text') {
              setCurrentStep('Разпознаване на текст');
              setProgress(70);
            }
          }
        });

        setCurrentStep('Зареждане на български език');
        await worker.loadLanguage('bul');
        await worker.initialize('bul');
        setProgress(80);

        setCurrentStep('Оптимизация на разпознаването');
        await worker.setParameters({
          // Bulgarian specific settings
          tessedit_char_whitelist: 'абвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ0123456789.,-_()№ ',
          preserve_interword_spaces: '1',

          // Page segmentation - optimized for scanned documents
          tessedit_pageseg_mode: '1',

          // Quality settings
          tessedit_do_invert: '0',
          textord_heavy_nr: '1',

          // Language settings
          load_system_dawg: '1',
          load_freq_dawg: '1',

          // Confidence settings
          tessedit_min_confidence: '65',
          tessedit_reject_doc_percent: '50',

          // Debug settings
          tessedit_create_hocr: '1'
        });

        setCurrentStep('Извличане на текст');
        const { data: { text, hocr } } = await worker.recognize(imageUrl);

        await worker.terminate();
        URL.revokeObjectURL(imageUrl);

        if (text && text.trim().length > 0) {
          const processedText = text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\wабвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ\s.,\-_()№]/g, '')
            .trim();

          setCurrentStep('Анализ на данни');
          const extractedData = await DocumentAnalyzer.analyzeDocument(processedText);

          if (expectedType && extractedData.documentType !== expectedType) {
            throw new Error(`Очаква се ${getDocumentTypeName(expectedType)}, но документът изглежда като ${getDocumentTypeName(extractedData.documentType || 'other')}`);
          }

          setProgress(100);
          onScanComplete(processedText, extractedData);

          const documentType = extractedData.documentType 
            ? `Документът е разпознат като ${getDocumentTypeName(extractedData.documentType)}`
            : "Документът е сканиран успешно";

          toast({
            title: "Успешно сканиране",
            description: documentType,
          });
        } else {
          throw new Error("Не беше открит текст в документа");
        }
      } catch (error) {
        console.error('OCR Error:', error);
        toast({
          title: "Грешка при сканиране",
          description: error instanceof Error ? error.message : "Моля, опитайте с друг документ или проверете дали изображението е достатъчно ясно.",
          variant: "destructive"
        });
      } finally {
        setScanning(false);
        setProgress(0);
        setCurrentStep('');
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <Card>
      <CardContent className="pt-6">
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
                  {isDragActive ? "Пуснете документа тук" : expectedType 
                    ? `Качете ${getDocumentTypeName(expectedType).toLowerCase()}`
                    : "Качете или плъзнете документ"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Поддържани формати: PNG, JPG, TIFF (ясни снимки на документи)
                </p>
                {!expectedType && (
                  <div className="flex gap-2 justify-center mt-2">
                    <Badge variant="outline">Нотариален акт</Badge>
                    <Badge variant="outline">Скица</Badge>
                    <Badge variant="outline">Данъчна оценка</Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}