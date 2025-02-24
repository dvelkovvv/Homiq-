import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DocumentAnalyzer } from "@/lib/documentAnalyzer";
import { PropertyAIAnalyzer, DocumentAnalysis } from "@/lib/propertyAIAnalyzer";
import { Badge } from "@/components/ui/badge";

interface DocumentScannerProps {
  onScanComplete: (text: string, extractedData?: any, documentAnalysis?: DocumentAnalysis) => void;
}

export function DocumentScanner({ onScanComplete }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const detectDocumentType = (text: string): DocumentAnalysis['type'] => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('нотариален акт') || lowerText.includes('нотариус')) {
      return 'notary_act';
    }
    if (lowerText.includes('скица') || lowerText.includes('кадастрална')) {
      return 'sketch';
    }
    if (lowerText.includes('данъчна оценка') || lowerText.includes('удостоверение за данъчна')) {
      return 'tax_assessment';
    }
    return 'other';
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setScanning(true);
      setProgress(0);

      try {
        const file = acceptedFiles[0];
        const imageUrl = URL.createObjectURL(file);

        toast({
          title: "Сканиране започна",
          description: "Моля, изчакайте докато анализираме документа.",
        });

        const worker = await createWorker();
        await worker.loadLanguage('bul');
        await worker.initialize('bul');

        await worker.setParameters({
          tessedit_char_whitelist: 'абвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ0123456789.,-_() ',
          preserve_interword_spaces: '1',
          tessedit_pageseg_mode: '1'
        });

        const { data: { text } } = await worker.recognize(imageUrl);

        await worker.terminate();
        URL.revokeObjectURL(imageUrl);

        if (text && text.trim().length > 0) {
          const processedText = text
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\wабвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ\s.,\-_()]/g, '')
            .trim();

          // Определяме типа на документа
          const documentType = detectDocumentType(processedText);

          // Използваме AI анализатора за по-прецизно извличане на данни
          const aiAnalyzer = PropertyAIAnalyzer.getInstance();
          const documentAnalysis = await aiAnalyzer.analyzeDocument(processedText, documentType);

          // Показваме предупреждения, ако анализът не е достатъчно уверен
          if (documentAnalysis.confidence < 0.7) {
            toast({
              title: "Внимание при анализа",
              description: "Някои данни може да не са извлечени с достатъчна точност.",
              variant: "warning",
            });
          }

          onScanComplete(processedText, documentAnalysis.extractedData, documentAnalysis);

          toast({
            title: "Успешно сканиране",
            description: `Документът е разпознат като ${getDocumentTypeName(documentType)}. Точност на анализа: ${Math.round(documentAnalysis.confidence * 100)}%`,
          });
        } else {
          throw new Error("Не беше открит текст в документа");
        }
      } catch (error) {
        console.error('OCR Error:', error);
        toast({
          title: "Грешка при сканиране",
          description: "Моля, опитайте с друг документ или проверете дали изображението е достатъчно ясно.",
          variant: "destructive"
        });
      } finally {
        setScanning(false);
        setProgress(100);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false
  });

  const getDocumentTypeName = (type: DocumentAnalysis['type']): string => {
    const types: Record<DocumentAnalysis['type'], string> = {
      'notary_act': 'Нотариален акт',
      'sketch': 'Скица',
      'tax_assessment': 'Данъчна оценка',
      'other': 'Друг документ'
    };
    return types[type];
  };

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
                <p className="font-medium">Сканиране на документа...</p>
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
                  Поддържани формати: PNG, JPG (ясни снимки на документи)
                </p>
                <div className="flex gap-2 justify-center mt-2">
                  <Badge variant="outline">Нотариален акт</Badge>
                  <Badge variant="outline">Скица</Badge>
                  <Badge variant="outline">Данъчна оценка</Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}