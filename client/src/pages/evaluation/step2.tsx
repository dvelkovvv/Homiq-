import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import {
  HelpCircle,
  Image as ImageIcon,
  Download,
  X,
  Clock,
  CheckCircle,
  FileText,
  Home,
  Building2,
  Store,
  Warehouse,
  LandPlot
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { DocumentScanner } from "@/components/document-scanner";
import { Info } from "lucide-react";
import { InstructionCard } from "@/components/instruction-card";
import { Spinner } from "@/components/ui/spinner";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface DocumentStatus {
  notary_act: boolean;
  sketch: boolean;
  tax_assessment: boolean;
}

type EvaluationType = "quick" | "licensed";

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

interface RoomPhotos {
  roomType: string;
  photos: File[];
  description: string;
}

export default function Step2() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationType, setEvaluationType] = useState<EvaluationType>("quick");
  const [documentsStatus, setDocumentsStatus] = useState<DocumentStatus>({
    notary_act: false,
    sketch: false,
    tax_assessment: false
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [roomPhotos, setRoomPhotos] = useState<RoomPhotos[]>([]);
  const [propertyData, setPropertyData] = useState<any>(() => 
    JSON.parse(localStorage.getItem('propertyData') || '{}')
  );

  const handleScanComplete = (text: string, data: any) => {
    if (data) {
      const updatedPropertyData = {
        ...propertyData,
        documents: [...(propertyData.documents || []), {
          type: data.documentType,
          extractedData: data,
          text: text,
          scannedAt: new Date().toISOString()
        }]
      };

      setPropertyData(updatedPropertyData);
      localStorage.setItem('propertyData', JSON.stringify(updatedPropertyData));

      if (data.documentType) {
        setDocumentsStatus(prev => ({
          ...prev,
          [data.documentType]: true
        }));
      }

      toast({
        title: "Документът е сканиран успешно",
        description: "Данните са извлечени и запазени.",
      });
    }
  };

  const handleImagesAdded = (files: File[]) => {
    setUploadedImages(prev => [...prev, ...files]);
    toast({
      title: "Снимките са качени успешно",
      description: `${files.length} ${files.length === 1 ? 'снимка е добавена' : 'снимки са добавени'}`,
    });
  };

  const handleRoomPhotosAdded = (roomType: string, files: File[]) => {
    setRoomPhotos(prev => prev.map(room =>
      room.roomType === roomType
        ? { ...room, photos: [...room.photos, ...files] }
        : room
    ));
  };

  const handleRoomDescriptionChange = (roomType: string, description: string) => {
    setRoomPhotos(prev => prev.map(room =>
      room.roomType === roomType
        ? { ...room, description }
        : room
    ));
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveRoomPhoto = (roomType: string, photoIndex: number) => {
    setRoomPhotos(prev => prev.map(room =>
      room.roomType === roomType
        ? { ...room, photos: room.photos.filter((_, i) => i !== photoIndex) }
        : room
    ));
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);

      // Сохраняем все фотографии в propertyData
      const updatedPropertyData = {
        ...propertyData,
        evaluationType,
        images: uploadedImages,
        roomPhotos
      };

      localStorage.setItem('propertyData', JSON.stringify(updatedPropertyData));
      localStorage.setItem('currentStep', '3');

      toast({
        title: "Успешно запазени данни",
        description: "Продължете към преглед на оценката.",
      });

      setLocation('/evaluation/step3');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Грешка",
        description: "Възникна проблем при запазването на данните. Моля, опитайте отново.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Изберете тип оценка</CardTitle>
                <CardDescription>
                  Изберете между бърза или лицензирана оценка на имота
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={evaluationType} onValueChange={(value) => setEvaluationType(value as EvaluationType)}>
                  <TabsList className="grid w-full grid-cols-2 gap-4 h-auto p-1">
                    <TabsTrigger
                      value="quick"
                      className={`flex flex-col items-center gap-2 p-4 data-[state=active]:bg-blue-50 ${
                        evaluationType === "quick" ? "border-2 border-blue-500" : ""
                      }`}
                    >
                      <Clock className="h-8 w-8 text-blue-500" />
                      <div className="text-center">
                        <h3 className="font-semibold">Бърза оценка</h3>
                        <p className="text-sm text-gray-600">Получете оценка до 24 часа</p>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      value="licensed"
                      className={`flex flex-col items-center gap-2 p-4 data-[state=active]:bg-green-50 ${
                        evaluationType === "licensed" ? "border-2 border-green-500" : ""
                      }`}
                    >
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <div className="text-center">
                        <h3 className="font-semibold">Лицензирана оценка</h3>
                        <p className="text-sm text-gray-600">Пълен анализ от експерт</p>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>

            {evaluationType === "quick" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Общи снимки на имота
                  </CardTitle>
                  <CardDescription>
                    Качете общи снимки на имота за по-добра оценка
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadZone
                    accept={{
                      'image/*': ['.png', '.jpg', '.jpeg']
                    }}
                    maxFiles={10}
                    onFilesAdded={handleImagesAdded}
                    fileType="image"
                  />
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Документи за имота
                  </CardTitle>
                  <CardDescription>
                    Качете необходимите документи за точна оценка
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className={`p-4 border rounded-lg ${documentsStatus.notary_act ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Нотариален акт</h4>
                        {documentsStatus.notary_act && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Документ за собственост</p>
                      <DocumentScanner
                        onScanComplete={handleScanComplete}
                        expectedType="notary_act"
                      />
                    </div>

                    <div className={`p-4 border rounded-lg ${documentsStatus.sketch ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Скица</h4>
                        {documentsStatus.sketch && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Официален документ от кадастъра</p>
                      <DocumentScanner
                        onScanComplete={handleScanComplete}
                        expectedType="sketch"
                      />
                    </div>

                    <div className={`p-4 border rounded-lg ${documentsStatus.tax_assessment ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Данъчна оценка</h4>
                        {documentsStatus.tax_assessment && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Актуална данъчна оценка</p>
                      <DocumentScanner
                        onScanComplete={handleScanComplete}
                        expectedType="tax_assessment"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setLocation("/evaluation/step1")}>
                Назад
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-[#003366] hover:bg-[#002244]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Обработка...
                  </>
                ) : (
                  'Продължи към оценка'
                )}
              </Button>
            </div>
          </motion.div>

          <div className="hidden lg:block space-y-4">
            <InstructionCard
              icon={<Info className="h-5 w-5 text-blue-500" />}
              title="Как да качите документи и снимки?"
              description={
                evaluationType === "quick"
                  ? "Изберете качествени снимки на имота. Системата ще анализира локацията и основната информация за бърза оценка."
                  : "Качете необходимите документи и снимки. Колкото повече информация предоставите, толкова по-точна ще бъде оценката."
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}