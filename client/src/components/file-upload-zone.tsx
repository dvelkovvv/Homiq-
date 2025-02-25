import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Image as ImageIcon, FileText, Upload, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

interface FileUploadZoneProps {
  accept: {
    [key: string]: string[];
  };
  maxFiles?: number;
  maxSize?: number;
  onFilesAdded: (files: File[]) => void;
  fileType: "image" | "document";
  roomType?: string;
}

const getRoomTypeName = (type: string): string => {
  const types: Record<string, string> = {
    entrance: "входна врата",
    kitchen: "кухня",
    living: "хол",
    bathroom: "баня",
    bedroom: "спалня"
  };
  return types[type] || type;
};

export function FileUploadZone({
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesAdded,
  fileType,
  roomType
}: FileUploadZoneProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setUploadProgress(25);
      setProcessing(true);

      if (fileType === "document") {
        // Симулираме процес на разпознаване на документи
        setProcessingStatus("Проверка на документите...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUploadProgress(50);

        setProcessingStatus("Разпознаване на текст...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setUploadProgress(75);

        setProcessingStatus("Извличане на данни...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setUploadProgress(100);
      onFilesAdded(acceptedFiles);

      toast({
        title: fileType === "document" ? "Документите са обработени успешно" : "Файловете са качени успешно",
        description: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>
              {`${acceptedFiles.length} ${acceptedFiles.length === 1 ? 'файл е добавен' : 'файла са добавени'}`}
            </span>
          </div>
        ),
      });

      setTimeout(() => {
        setUploadProgress(0);
        setProcessing(false);
        setProcessingStatus("");
      }, 1500);
    } catch (error) {
      console.error('Error handling files:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при обработката на файловете.",
        variant: "destructive"
      });
      setProcessing(false);
      setProcessingStatus("");
    }
  }, [onFilesAdded, fileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    disabled: processing
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative
        flex 
        justify-center 
        rounded-lg 
        border-2 
        border-dashed 
        px-6 
        py-10 
        transition-colors
        hover:bg-accent/5
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
        ${isDragActive ? 'cursor-copy' : processing ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${processing ? 'opacity-80' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        {processing ? (
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto"
            >
              <Loader2 className="h-12 w-12 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">{processingStatus}</p>
              {uploadProgress > 0 && (
                <div className="w-48 mx-auto">
                  <Progress value={uploadProgress} className="h-1" />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {fileType === "image" ? (
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/60" />
            ) : (
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/60" />
            )}

            <AnimatePresence>
              {isDragActive ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-4"
                >
                  <p className="text-primary font-medium">
                    Пуснете файловете тук
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-4"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    {fileType === "image" ? (
                      roomType ? (
                        <>Добавете снимки на {getRoomTypeName(roomType).toLowerCase()}</>
                      ) : (
                        <>Плъзнете снимки тук или</>
                      )
                    ) : (
                      <>Плъзнете документи тук или</>
                    )}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-2 text-sm font-medium text-primary hover:text-primary/80"
                    disabled={processing}
                  >
                    изберете файлове
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {fileType === "image" ? (
                      <>PNG, JPG до {maxSize / 1024 / 1024}MB</>
                    ) : (
                      <>PDF до {maxSize / 1024 / 1024}MB</>
                    )}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}