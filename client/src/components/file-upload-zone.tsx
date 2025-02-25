import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Image as ImageIcon, X, FileText, Upload } from "lucide-react";
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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      // Симулираме прогрес на качването
      setUploadProgress(25);
      setTimeout(() => setUploadProgress(75), 500);

      onFilesAdded(acceptedFiles);

      toast({
        title: "Файловете са качени успешно",
        description: `${acceptedFiles.length} ${acceptedFiles.length === 1 ? 'файл е добавен' : 'файла са добавени'}`,
      });

      setTimeout(() => setUploadProgress(100), 1000);
      setTimeout(() => setUploadProgress(0), 1500);
    } catch (error) {
      console.error('Error handling files:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при обработката на файловете.",
        variant: "destructive"
      });
    }
  }, [onFilesAdded]);

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
        hover:bg-accent/5
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
        ${isDragActive ? 'cursor-copy' : 'cursor-pointer'}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
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
      </div>

      {uploadProgress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}
    </div>
  );
}