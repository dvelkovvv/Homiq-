import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { DocumentAnalyzer } from "@/lib/documentAnalyzer";

interface DocumentScannerProps {
  onScanComplete: (text: string, data?: any) => void;
  expectedType?: 'notary_act' | 'sketch' | 'tax_assessment';
}

export function DocumentScanner({ onScanComplete, expectedType }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      setScanning(true);
      setProgress(0);
      setCurrentStep('Подготовка на документа');

      try {
        const file = acceptedFiles[0];
        const imageUrl = URL.createObjectURL(file);

        toast({
          title: "Сканиране започна",
          description: "Моля, изчакайте докато анализираме документа.",
        });

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

        setCurrentStep('Оптимизация на разпознаването');
        await worker.setParameters({
          // Character whitelist for Bulgarian documents
          tessedit_char_whitelist: 'абвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ0123456789.,-_()№ ',

          // Preserve word spacing for better text analysis
          preserve_interword_spaces: '1',

          // Use PSM 3 for more accurate page layout analysis
          tessedit_pageseg_mode: '3',  // Fully automatic page segmentation, but no OSD

          // Enable document dictionary for better word recognition
          tessedit_enable_doc_dict: '1',

          // Better handling of structured documents
          tessedit_create_hocr: '1',

          // Language model tuning
          language_model_penalty_non_dict_word: '0.8',  // More permissive for non-dictionary words
          language_model_penalty_non_freq_dict_word: '0.1',

          // Improve character segmentation
          chop_enable: '1',
          use_new_state_cost: '1',
          segment_penalty_dict_nonword: '1.24',
          segment_penalty_garbage: '1.5',

          // Stability improvements
          stopper_nondict_certainty_base: '-2.5',

          // Quality and speed balance
          tessdata_fast_mode: '0',
          tessedit_fast_mode: '0'
        });

        setCurrentStep('Извличане на текст');
        const { data: { text, hocr, tsv } } = await worker.recognize(imageUrl);
        setProgress(90);

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

          const extractedInfo = [];
          if (extractedData.owner) extractedInfo.push(`Собственик: ${extractedData.owner}`);
          if (extractedData.squareMeters) extractedInfo.push(`Площ: ${extractedData.squareMeters} кв.м`);
          if (extractedData.identifier) extractedInfo.push(`Идентификатор: ${extractedData.identifier}`);
          if (extractedData.price) extractedInfo.push(`Цена: ${extractedData.price.toLocaleString()} лв.`);
          if (extractedData.documentDate) extractedInfo.push(`Дата: ${extractedData.documentDate}`);

          toast({
            title: "Успешно сканиране",
            description: (
              <>
                {documentType}
                {extractedInfo.length > 0 && (
                  <div className="mt-2 text-sm space-y-1">
                    <p className="font-medium">Извлечени данни:</p>
                    {extractedInfo.map((info, index) => (
                      <p key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {info}
                      </p>
                    ))}
                  </div>
                )}
              </>
            ),
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
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false
  });

  const getDocumentTypeName = (type: string): string => {
    const types: Record<string, string> = {
      'notary_act': 'Нотариален акт',
      'sketch': 'Скица',
      'tax_assessment': 'Данъчна оценка',
      'other': 'Друг документ'
    };
    return types[type] || types.other;
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
                  Поддържани формати: PNG, JPG (ясни снимки на документи)
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