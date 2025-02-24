import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Info, HelpCircle, FileText, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { motion, AnimatePresence } from "framer-motion";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { InstructionCard } from "@/components/instruction-card";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { FileUploadZone } from "@/components/file-upload-zone";
import { DocumentScanner } from "@/components/document-scanner";

interface FileWithPreview extends File {
  preview?: string;
}

const STEPS = [
  {
    title: "Основна информация",
    description: "Въведете детайли за имота"
  },
  {
    title: "Медия файлове",
    description: "Качете снимки и документи"
  },
  {
    title: "Оценка",
    description: "Преглед на резултатите"
  }
];

export default function Step2() {
  const [, navigate] = useLocation();
  const [images, setImages] = useState<FileWithPreview[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [scannedText, setScannedText] = useState<string>("");
  const propertyId = new URLSearchParams(window.location.search).get('propertyId');

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
    }
    return () => images.forEach(image => image.preview && URL.revokeObjectURL(image.preview));
  }, [propertyId, navigate, images]);

  useUnsavedChanges(images.length > 0 || documents.length > 0);

  const handleImagesAdded = (files: File[]) => {
    const newImages = files.map(file => {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      return fileWithPreview;
    });

    setImages(prev => [...prev, ...newImages]);
    toast({
      title: "Снимки качени успешно",
      description: `${files.length} ${files.length === 1 ? 'снимка беше качена' : 'снимки бяха качени'} успешно.`
    });
  };

  const handleDocumentsAdded = (files: File[]) => {
    setDocuments(prev => [...prev, ...files]);
    toast({
      title: "Документи качени успешно",
      description: `${files.length} ${files.length === 1 ? 'документ беше качен' : 'документа бяха качени'} успешно.`
    });
  };

  const handleScanComplete = (text: string) => {
    setScannedText(text);
    toast({
      title: "Документът е сканиран успешно",
      description: "Текстът е извлечен от документа.",
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].preview) {
        URL.revokeObjectURL(newImages[index].preview!);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => {
      const newDocs = [...prev];
      newDocs.splice(index, 1);
      return newDocs;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={2} steps={STEPS} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Качване на файлове</CardTitle>
                <CardDescription>
                  Качете снимки и документи за вашия имот за по-точна оценка
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium mb-2">Снимки на имота</h3>
                    <FileUploadZone
                      accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                      maxFiles={10}
                      maxSize={10 * 1024 * 1024}
                      onFilesAdded={handleImagesAdded}
                      fileType="image"
                    />

                    <AnimatePresence>
                      {images.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="mt-6"
                        >
                          <h3 className="font-medium mb-4">Качени снимки:</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {images.map((file, i) => (
                              <motion.div
                                key={`img-${i}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative group aspect-square"
                              >
                                <img
                                  src={file.preview}
                                  alt={`Preview ${i + 1}`}
                                  className="h-full w-full object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                <Button
                                  onClick={() => removeImage(i)}
                                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <X className="h-4 w-4 text-white" />
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="text-base font-medium mb-2">Документи за имота</h3>
                    <DocumentScanner onScanComplete={handleScanComplete} />

                    {scannedText && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Извлечен текст:</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{scannedText}</p>
                      </div>
                    )}

                    <div className="mt-6">
                      <FileUploadZone
                        accept={{ 'application/pdf': ['.pdf'] }}
                        maxFiles={5}
                        maxSize={10 * 1024 * 1024}
                        onFilesAdded={handleDocumentsAdded}
                        fileType="document"
                      />
                    </div>

                    {documents.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-4">Качени документи:</h3>
                        <div className="space-y-2">
                          {documents.map((file, i) => (
                            <div
                              key={`doc-${i}`}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{file.name}</span>
                              </div>
                              <Button
                                onClick={() => removeDocument(i)}
                                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                size="icon"
                                variant="ghost"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate("/evaluation/step1")}>
                  Назад
                </Button>
                <Button
                  onClick={() => navigate(`/evaluation/step3?propertyId=${propertyId}`)}
                  className="bg-[#003366] hover:bg-[#002244]"
                  disabled={images.length === 0}
                >
                  Продължи към оценка
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <div className="hidden lg:block space-y-4">
            <InstructionCard
              icon={<Info className="h-5 w-5 text-blue-500" />}
              title="Как да качите файлове?"
              description="Изберете качествени снимки на имота и сканирани копия на необходимите документи. Системата автоматично ще анализира текста в документите."
            />
            <InstructionCard
              icon={<HelpCircle className="h-5 w-5 text-green-500" />}
              title="Какви документи са необходими?"
              description="Качете сканирани копия на документите за собственост, скици, данъчни оценки и други релевантни документи. Системата ще извлече важната информация автоматично."
            />
          </div>
        </div>
      </main>

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 md:hidden rounded-full h-12 w-12 bg-primary shadow-lg"
            size="icon"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Как да качите файлове?</DialogTitle>
          <DialogDescription>
            Изберете качествени снимки на имота и сканирани копия на необходимите документи.
            Системата поддържа автоматично разпознаване на текст от документи и ще извлече важната информация.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
}