import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface DocumentScannerProps {
  onScanComplete: (text: string, data: any) => void;
  expectedType?: 'notary_act' | 'sketch' | 'tax_assessment';
}

interface ExtractedData {
  squareMeters?: number;
  constructionYear?: number;
  price?: number;
  rooms?: number;
  floor?: number;
  totalFloors?: number;
  cadastralNumber?: string;
  notaryNumber?: string;
  documentDate?: string;
  taxAssessmentValue?: number;
  boundaries?: string[];
  purpose?: string;
  builtUpArea?: number;
  totalArea?: number;
  commonParts?: string;
}

export function DocumentScanner({ onScanComplete, expectedType }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const getDocumentTypeName = (type: string): string => {
    const types: Record<string, string> = {
      'notary_act': 'Нотариален акт',
      'sketch': 'Скица',
      'tax_assessment': 'Данъчна оценка'
    };
    return types[type] || 'Документ';
  };

  const extractDocumentData = (text: string, type: string): ExtractedData => {
    const data: ExtractedData = {};

    // Common patterns with improved regex
    const patterns = {
      area: /(?:застроена|разгъната|обща|площ)[^\d]*(\d+(?:[,.]\d+)?)\s*(?:кв\.м|кв\.метра|квадратни метра)/gi,
      year: /(?:построена?|завършен)[^\d]*(?:през\s+)?(\d{4})/i,
      price: /(?:цена|стойност|оценка)[^\d]*(\d+(?:\s*\d+)*)[^\d]*(?:лева|лв|\.|$)/i,
      rooms: /(\d+)(?:\s*(?:стаи|стаен|стайни|стайно))/i,
      floor: /(?:ет\.|етаж|находящ[^\d]*на)\s*(\d+)(?:\s*[-]/\s*(\d+))?/i,
      cadastral: /(?:кадастрален|идентификационен)[^\d\n]*(?:номер|№)?[^\d\n]*([0-9.]+)/i,
      boundaries: /граничи\s*(?:със|с|на|при\s+съседи)[:;\s]+((?:[^,.]+,?\s*)+)/i,
      purpose: /(?:предназначение|използва\s+се\s+за)[:\s]+([^,.;]+)/i
    };

    // Improved text preprocessing
    const cleanText = text
      .replace(/\s+/g, ' ')
      .replace(/[_|]/g, '')
      .trim();

    // Extract data using patterns
    for (const [key, pattern] of Object.entries(patterns)) {
      const matches = cleanText.match(pattern);
      if (matches) {
        switch (key) {
          case 'area':
            // Handle multiple area matches
            const areas = Array.from(cleanText.matchAll(pattern))
              .map(m => parseFloat(m[1].replace(/\s/g, '').replace(',', '.')));
            if (areas.length > 0) {
              data.squareMeters = areas[0];
              if (areas.length > 1) {
                data.totalArea = areas[1];
              }
            }
            break;
          case 'year':
            const year = parseInt(matches[1]);
            if (year >= 1800 && year <= new Date().getFullYear()) {
              data.constructionYear = year;
            }
            break;
          case 'price':
            data.price = parseInt(matches[1].replace(/\s/g, ''));
            break;
          case 'rooms':
            data.rooms = parseInt(matches[1]);
            break;
          case 'floor':
            data.floor = parseInt(matches[1]);
            if (matches[2]) {
              data.totalFloors = parseInt(matches[2]);
            }
            break;
          case 'cadastral':
            data.cadastralNumber = matches[1].trim();
            break;
          case 'boundaries':
            data.boundaries = matches[1]
              .split(/[,;]/)
              .map(b => b.trim())
              .filter(b => b.length > 0);
            break;
          case 'purpose':
            data.purpose = matches[1].trim();
            break;
        }
      }
    }

    // Document-specific processing
    switch (type) {
      case 'notary_act':
        const notaryPattern = /акт\s*(?:№|номер)?\s*(\d+)(?:[^0-9]+(\d{2}[-.]\d{2}[-.](?:19|20)\d{2}))?/i;
        const notaryMatch = cleanText.match(notaryPattern);
        if (notaryMatch) {
          data.notaryNumber = notaryMatch[1];
          if (notaryMatch[2]) {
            data.documentDate = notaryMatch[2];
          }
        }

        // Extract common parts information
        const commonPartsPattern = /общи\s+части[^:]*:\s*([^.]+)/i;
        const commonPartsMatch = cleanText.match(commonPartsPattern);
        if (commonPartsMatch) {
          data.commonParts = commonPartsMatch[1].trim();
        }
        break;

      case 'tax_assessment':
        const taxPattern = /данъчна[^\d]*оценка[^\d]*(\d+(?:\s*\d+)*)/i;
        const taxMatch = cleanText.match(taxPattern);
        if (taxMatch) {
          data.taxAssessmentValue = parseInt(taxMatch[1].replace(/\s/g, ''));
        }
        break;
    }

    return data;
  };

  const validateImage = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
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

  const handleRemoveImage = () => {
    if (uploadedImage) {
      URL.revokeObjectURL(uploadedImage);
      setUploadedImage(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Твърде голям файл",
          description: "Моля, използвайте файл по-малък от 10MB",
          variant: "destructive"
        });
        return;
      }

      if (!(await validateImage(file))) {
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

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

        // Оптимизирани параметри за по-добро разпознаване
        await worker.setParameters({
          tessedit_char_whitelist: '0123456789.,абвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ- ',
          tessedit_pageseg_mode: '1',
          tessedit_ocr_engine_mode: '1',
          tessedit_do_invert: '0',
          textord_heavy_nr: '1',
          textord_min_linesize: '3',
          preserve_interword_spaces: '1'
        });

        setProgress(70);

        const { data: { text } } = await worker.recognize(file);
        await worker.terminate();

        if (!text || text.trim().length < 50) {
          throw new Error("Не беше открит достатъчно текст в документа. Моля, проверете качеството на изображението.");
        }

        const extractedData = extractDocumentData(text.trim(), expectedType || '');

        const data = {
          documentType: expectedType,
          extractedData,
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
        handleRemoveImage();
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

      {uploadedImage && (
        <div className="relative aspect-video rounded-lg overflow-hidden group">
          <img 
            src={uploadedImage} 
            alt="Качен документ" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}