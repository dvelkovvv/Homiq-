import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Image as ImageIcon, X, FileText, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadZoneProps {
  accept: {
    [key: string]: string[];
  };
  maxFiles?: number;
  maxSize?: number;
  onFilesAdded: (files: File[]) => void;
  fileType: "image" | "document";
}

export function FileUploadZone({
  accept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  onFilesAdded,
  fileType
}: FileUploadZoneProps) {
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Симулираме прогрес на качването
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        onFilesAdded(acceptedFiles);
        setUploadProgress(0);
      }
    }, 100);
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
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-900/25'}
        ${isDragActive ? 'cursor-copy' : 'cursor-pointer'}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
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
      </div>

      {uploadProgress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}
    </div>
  );
}
