import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentScannerProps {
  onScanComplete: (text: string) => void;
}

export function DocumentScanner({ onScanComplete }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const processFile = async (file: File) => {
    try {
      setScanning(true);
      setProgress(0);

      // Create a new worker for each scan
      const worker = await createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        }
      });

      // Настройваме за български език и добавяме специфични параметри
      await worker.loadLanguage('bul');
      await worker.initialize('bul');
      await worker.setParameters({
        tessedit_char_whitelist: 'абвгдежзийклмнопрстуфхцчшщъьюяАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЬЮЯ0123456789.,- ',
        preserve_interword_spaces: '1',
        tessedit_pageseg_mode: '1'
      });

      // Convert file to image URL
      const imageUrl = URL.createObjectURL(file);

      // Recognize text
      const { data: { text } } = await worker.recognize(imageUrl);

      // Clean up
      URL.revokeObjectURL(imageUrl);
      await worker.terminate();

      if (text) {
        // Премахваме излишни интервали и нови редове
        const cleanedText = text
          .replace(/\s+/g, ' ')
          .trim();

        if (cleanedText.length > 0) {
          onScanComplete(cleanedText);
          toast({
            title: "Документът е сканиран успешно",
            description: "Текстът е извлечен от документа.",
          });
        } else {
          throw new Error("Не беше открит текст в документа");
        }
      } else {
        throw new Error("Не беше открит текст в документа");
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Грешка при сканиране",
        description: "Моля, опитайте отново с друг документ или проверете дали изображението е ясно.",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        await processFile(file);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp'],
      'application/pdf': ['.pdf']
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
                  Поддържани формати: PNG, JPG, PDF
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}