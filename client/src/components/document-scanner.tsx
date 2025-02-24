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

          // Анализираме извлечения текст
          const analysisResult = await DocumentAnalyzer.analyzeDocument(processedText);
          const warnings = DocumentAnalyzer.validateData(analysisResult.extractedData);

          // Определяме типа на документа
          const documentType = detectDocumentType(processedText);

          // Създаваме анализ на документа
          const documentAnalysis: DocumentAnalysis = {
            type: documentType,
            confidence: analysisResult.confidence,
            extractedData: {
              ...analysisResult.extractedData,
              // Добавяме допълнителни данни в зависимост от типа документ
              cadastralNumber: documentType === 'sketch' ? 
                extractCadastralNumber(processedText) : undefined,
              buildingRights: documentType === 'sketch' ? 
                extractBuildingRights(processedText) : undefined,
              taxAssessment: documentType === 'tax_assessment' ? 
                extractTaxAssessment(processedText) : undefined
            }
          };

          // Показваме предупреждения, ако има такива
          if (warnings.length > 0) {
            toast({
              title: "Внимание при анализа",
              description: warnings.join(". "),
              variant: "warning",
            });
          }

          onScanComplete(processedText, analysisResult.extractedData, documentAnalysis);

          toast({
            title: "Успешно сканиране",
            description: `Документът е разпознат като ${getDocumentTypeName(documentType)}. Точност на анализа: ${Math.round(analysisResult.confidence)}%`,
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

  const extractCadastralNumber = (text: string): string | undefined => {
    const match = text.match(/(?:кадастрален номер|идентификатор)[\s:]+([0-9.]+)/i);
    return match?.[1];
  };

  const extractBuildingRights = (text: string): string | undefined => {
    const match = text.match(/(?:застрояване|плътност)[\s:]+([^\n]+)/i);
    return match?.[1];
  };

  const extractTaxAssessment = (text: string): number | undefined => {
    const match = text.match(/(?:данъчна оценка|стойност)[\s:]+(\d+(?:\s*\d+)*(?:\.\d+)?)/i);
    return match ? parseFloat(match[1].replace(/\s/g, '')) : undefined;
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