import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Image as ImageIcon, X, FileText, Upload, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomImageAnalyzer } from "@/lib/roomImageAnalyzer";
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

export function FileUploadZone({
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesAdded,
  fileType,
  roomType
}: FileUploadZoneProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      // Симулираме прогрес на качването
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setUploadProgress(0);
        }
      }, 100);

      if (fileType === "image" && roomType) {
        setAnalyzing(true);

        // Анализираме всяка снимка
        const analyzedFiles = [];
        for (const file of acceptedFiles) {
          try {
            const result = await RoomImageAnalyzer.analyzeImage(file);

            if (result.roomType === roomType) {
              analyzedFiles.push(file);
              toast({
                title: "Успешно разпознаване",
                description: `Снимката е разпозната като ${result.roomType} с ${Math.round(result.confidence * 100)}% увереност`,
              });
            } else {
              toast({
                title: "Внимание",
                description: `Снимката изглежда като ${result.roomType}, а не като ${roomType}. Моля, проверете дали сте избрали правилната снимка.`,
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('Error analyzing image:', error);
            toast({
              title: "Грешка при анализа",
              description: "Не успяхме да анализираме снимката. Моля, опитайте с друга.",
              variant: "destructive"
            });
          }
        }

        if (analyzedFiles.length > 0) {
          onFilesAdded(analyzedFiles);
        }
      } else {
        // За документи или снимки без специфичен тип стая
        onFilesAdded(acceptedFiles);
      }
    } catch (error) {
      console.error('Error handling files:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при обработката на файловете.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  }, [onFilesAdded, fileType, roomType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
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
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-900/25'}
        ${isDragActive ? 'cursor-copy' : 'cursor-pointer'}
        ${analyzing ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        {analyzing ? (
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <ImageIcon className="mx-auto h-12 w-12 text-primary" />
            </motion.div>
            <p className="text-sm text-gray-500">Анализиране на изображението...</p>
          </div>
        ) : (
          <>
            {fileType === "image" ? (
              <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
            ) : (
              <FileText className="mx-auto h-12 w-12 text-gray-300" />
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
                  <p className="text-sm text-gray-500">
                    {fileType === "image" ? (
                      <>Плъзнете снимки тук или</>
                    ) : (
                      <>Плъзнете документи тук или</>
                    )}
                  </p>
                  <Button
                    variant="link"
                    className="mt-2 text-primary hover:text-primary/80"
                  >
                    изберете файлове
                    <Upload className="ml-2 h-4 w-4" />
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
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

      {uploadProgress > 0 && !analyzing && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}
    </div>
  );
}