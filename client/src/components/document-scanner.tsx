import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { DataComparison } from "@/lib/dataComparison";
import * as PDFJS from 'pdfjs-dist';

// Set the PDF.js worker from CDN
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.min.js`;

interface DocumentScannerProps {
  onScanComplete: (text: string, data: any) => void;
  expectedType?: 'notary_act' | 'sketch' | 'tax_assessment';
}

export function DocumentScanner({ onScanComplete, expectedType }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [extractedData, setExtractedData] = useState<any>(null);

  const getDocumentTypeName = (type: string): string => {
    const types: Record<string, string> = {
      'notary_act': 'Нотариален акт',
      'sketch': 'Скица',
      'tax_assessment': 'Данъчна оценка'
    };
    return types[type] || 'Документ';
  };

  const convertPDFToImage = async (file: File): Promise<string[]> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
    const imageUrls: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Увеличаваме мащаба за по-добро качество
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Неуспешно създаване на canvas контекст');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;

      imageUrls.push(canvas.toDataURL('image/png', 1.0));
    }

    return imageUrls;
  };

  const handleAutofill = () => {
    if (extractedData) {
      DataComparison.autofillFormData(extractedData);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setScanning(true);
      setProgress(0);
      setCurrentStep('Подготовка на документа');

      try {
        const file = acceptedFiles[0];
        let imageUrls: string[] = [];

        if (file.type === 'application/pdf') {
          setCurrentStep('Конвертиране на PDF');
          imageUrls = await convertPDFToImage(file);
          setProgress(20);
        } else {
          imageUrls = [URL.createObjectURL(file)];
        }

        const worker = await createWorker();

        // Зареждане на български език
        setCurrentStep('Зареждане на български език');
        await worker.loadLanguage('bul');
        await worker.initialize('bul');
        setProgress(40);

        // Оптимизирани параметри за по-добро разпознаване
        setCurrentStep('Оптимизация на разпознаването');
        await worker.setParameters({
          tessedit_char_whitelist: 'абвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ0123456789.,-_()№ ',
          preserve_interword_spaces: '1',
          tessedit_pageseg_mode: '6', // Приемаме, че страницата е един унифициран блок текст
          tessedit_enable_doc_dict: '1',
          textord_heavy_nr: '1', // Подобрява разпознаването на номера
          language_model_penalty_non_freq_dict_word: '0.5', // По-малко наказание за непознати думи
          language_model_penalty_non_dict_word: '0.5',
        });

        let allText = '';
        for (let i = 0; i < imageUrls.length; i++) {
          setCurrentStep(`Разпознаване на страница ${i + 1} от ${imageUrls.length}`);
          const { data: { text } } = await worker.recognize(imageUrls[i]);
          allText += text + '\n';
          setProgress(40 + Math.floor((i + 1) * 40 / imageUrls.length));
        }

        await worker.terminate();
        imageUrls.forEach(url => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        });

        if (allText.trim().length === 0) {
          throw new Error("Не беше открит текст в документа");
        }

        // Почистване и нормализация на текста
        const processedText = allText
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

        // Показване на извлечените данни
        const extractedInfo = [];
        if (data.squareMeters) extractedInfo.push(`Площ: ${data.squareMeters} кв.м`);
        if (data.constructionYear) extractedInfo.push(`Година на строителство: ${data.constructionYear}`);
        if (data.rooms) extractedInfo.push(`Брой стаи: ${data.rooms}`);
        if (data.floor) extractedInfo.push(`Етаж: ${data.floor}`);
        if (data.address) extractedInfo.push(`Адрес: ${data.address}`);

        toast({
          title: "Успешно сканиране",
          description: (
            <div className="space-y-2">
              <p>Документът е обработен успешно</p>
              {extractedInfo.map((info, index) => (
                <p key={index} className="text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {info}
                </p>
              ))}
            </div>
          ),
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
      'application/pdf': ['.pdf'],
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
                {isDragActive 
                  ? "Пуснете документа тук" 
                  : expectedType 
                    ? `Качете ${getDocumentTypeName(expectedType).toLowerCase()}`
                    : "Качете или плъзнете документ"}
              </p>
              <p className="text-sm text-muted-foreground">
                Поддържани формати: PDF, PNG, JPG (ясни копия на документи)
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