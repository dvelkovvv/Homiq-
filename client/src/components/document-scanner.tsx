import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { createWorker } from 'tesseract.js';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, FileText, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentScannerProps {
  onScanComplete: (text: string) => void;
}

export function DocumentScanner({ onScanComplete }: DocumentScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const scanDocument = async (file: File) => {
    try {
      setScanning(true);
      setProgress(0);

      const worker = await createWorker({
        logger: progress => {
          if (progress.status === 'recognizing text') {
            setProgress(progress.progress * 100);
          }
        },
      });

      await worker.loadLanguage('bul');
      await worker.initialize('bul');
      
      const { data: { text } } = await worker.recognize(file);
      
      await worker.terminate();
      
      onScanComplete(text);
      toast({
        title: "Документът е сканиран успешно",
        description: "Текстът е извлечен и анализиран.",
      });
    } catch (error) {
      console.error('OCR Error:', error);
      toast({
        title: "Грешка при сканиране",
        description: "Моля, опитайте отново с друг документ.",
        variant: "destructive"
      });
    } finally {
      setScanning(false);
      setProgress(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      scanDocument(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
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
