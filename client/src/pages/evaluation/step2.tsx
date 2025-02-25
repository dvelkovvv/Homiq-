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

// Обновени типове стаи с новите икони
const RESIDENTIAL_ROOM_TYPES = [
  { id: "entrance", name: "Входна врата", icon: Home },
  { id: "kitchen", name: "Кухня", icon: Store },
  { id: "living", name: "Хол", icon: Building2 },
  { id: "bathroom", name: "Баня", icon: Home },
  { id: "bedroom", name: "Спалня", icon: Building2 }
];

const INDUSTRIAL_ROOM_TYPES = [
  { id: "production", name: "Производствена зона", icon: Store },
  { id: "storage", name: "Складова зона", icon: Warehouse },
  { id: "loading", name: "Товаро-разтоварна зона", icon: Warehouse },
  { id: "office", name: "Офис част", icon: Building2 }
];

const AGRICULTURAL_ROOM_TYPES = [
  { id: "field", name: "Обработваема земя", icon: LandPlot },
  { id: "irrigation", name: "Напоителна система", icon: Store },
  { id: "storage", name: "Складови съоръжения", icon: Warehouse }
];

interface RoomPhotos {
  roomType: string;
  photos: File[];
  description: string;
}

export default function Step2() {
  const [, setLocation] = useLocation();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState<string>("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [roomPhotos, setRoomPhotos] = useState<RoomPhotos[]>([]);
  const [evaluationType, setEvaluationType] = useState<EvaluationType>("quick");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentsStatus, setDocumentsStatus] = useState<DocumentStatus>({
    notary_act: false,
    sketch: false,
    tax_assessment: false
  });

  // Get property data from localStorage instead of URL params
  const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
  const propertyType = propertyData.type || 'apartment';
  const rooms = propertyData.rooms || 0;

  const getRoomTypes = () => {
    switch (propertyType) {
      case 'apartment':
      case 'house':
      case 'villa':
        return RESIDENTIAL_ROOM_TYPES;
      case 'industrial':
        return INDUSTRIAL_ROOM_TYPES;
      case 'agricultural':
        return AGRICULTURAL_ROOM_TYPES;
      default:
        return [];
    }
  };

  useEffect(() => {
    // Check if we have property data
    if (!propertyData || !propertyData.type) {
      setLocation('/evaluation/step1');
      return;
    }

    // Initialize room photos array with appropriate room types
    const roomTypes = getRoomTypes();
    if (roomTypes.length > 0 && roomPhotos.length === 0) {
      setRoomPhotos(
        roomTypes.map(room => ({
          roomType: room.id,
          photos: [],
          description: room.name
        }))
      );
    }
  }, []);

  const handleScanComplete = (text: string, data: any) => {
    setIsScanning(false);
    setScannedText(text);
    setExtractedData(data);

    // Get existing property data
    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');

    // Initialize or update documents array
    const documents = propertyData.documents || [];
    documents.push({
      type: data.documentType,
      extractedData: data,
      text: text,
      scannedAt: new Date().toISOString()
    });

    // Update document status
    if (data.documentType) {
      setDocumentsStatus(prev => ({
        ...prev,
        [data.documentType]: true
      }));
    }

    // Save back to localStorage
    localStorage.setItem('propertyData', JSON.stringify({
      ...propertyData,
      documents: documents
    }));

    toast({
      title: "Документът е сканиран успешно",
      description: "Текстът е извлечен от документа.",
    });
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
    toast({
      title: `Снимките за ${getRoomTypes().find(rt => rt.id === roomType)?.name} са качени успешно`,
      description: `${files.length} ${files.length === 1 ? 'снимка е добавена' : 'снимки са добавени'}`,
    });
  };

  const handleRoomDescriptionChange = (roomType: string, description: string) => {
    setRoomPhotos(prev => prev.map(room =>
      room.roomType === roomType
        ? { ...room, description }
        : room
    ));
  };

  const handleDocumentsAdded = (files: File[]) => {
    setUploadedDocuments(prev => [...prev, ...files]);
    toast({
      title: "Документите са качени успешно",
      description: `${files.length} ${files.length === 1 ? 'документ е добавен' : 'документа са добавени'}`,
    });
  };

  const handleDownload = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const handleRemoveDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);

      localStorage.setItem('currentStep', '3');

      // Save evaluation type to localStorage
      localStorage.setItem('evaluationType', evaluationType);

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
                <Tabs value={evaluationType} onValueChange={(value: EvaluationType) => setEvaluationType(value)}>
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
                  <TabsContent value="quick">
                    <div className="p-6 bg-blue-50 rounded-lg mt-4">
                      <h3 className="text-lg font-semibold mb-2 text-blue-700">Бърза оценка на имота</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-blue-600">
                          <Clock className="h-4 w-4" />
                          Оценка до 24 часа
                        </li>
                        <li className="flex items-center gap-2 text-sm text-blue-600">
                          <CheckCircle className="h-4 w-4" />
                          Базирана на локация и основна информация
                        </li>
                        <li className="flex items-center gap-2 text-sm text-blue-600">
                          <ImageIcon className="h-4 w-4" />
                          Изисква само основни снимки
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="licensed">
                    <div className="p-6 bg-green-50 rounded-lg mt-4">
                      <h3 className="text-lg font-semibold mb-2 text-green-700">Лицензирана оценка на имота</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Подробен анализ от лицензиран оценител
                        </li>
                        <li className="flex items-center gap-2 text-sm text-green-600">
                          <Home className="h-4 w-4" />
                          Оценка на всички помещения
                        </li>
                        <li className="flex items-center gap-2 text-sm text-green-600">
                          <ImageIcon className="h-4 w-4" />
                          Включва анализ на документи и снимки
                        </li>
                      </ul>
                    </div>
                  </TabsContent>
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
                              onClick={() => handleDownload(file)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
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
              <>
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

                    {uploadedDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedDocuments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-gray-50">
                            <span className="text-sm truncate">{file.name}</span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => handleDownload(file)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Изтегли
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => handleRemoveDocument(index)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Премахни
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {scannedText && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-medium mb-2 text-blue-700">Извлечена информация</h4>
                        <div className="space-y-2">
                          {extractedData?.squareMeters && (
                            <p className="text-sm text-blue-600">Квадратура: {extractedData.squareMeters} кв.м</p>
                          )}
                          {extractedData?.constructionYear && (
                            <p className="text-sm text-blue-600">Година на строителство: {extractedData.constructionYear}</p>
                          )}
                          {extractedData?.address && (
                            <p className="text-sm text-blue-600">Адрес: {extractedData.address}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {roomPhotos.length > 0 && getRoomTypes().map((roomType) => {
                  const room = roomPhotos.find(r => r.roomType === roomType.id);
                  if (!room) return null;

                  const Icon = roomType.icon;

                  return (
                    <Card key={roomType.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {roomType.name}
                        </CardTitle>
                        <CardDescription>
                          Качете снимки за {roomType.name.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <input
                            type="text"
                            className="w-full p-2 border rounded-lg"
                            value={room.description}
                            onChange={(e) => handleRoomDescriptionChange(roomType.id, e.target.value)}
                            placeholder={`Описание на ${roomType.name.toLowerCase()}`}
                          />
                        </div>

                        <FileUploadZone
                          accept={{
                            'image/*': ['.png', '.jpg', '.jpeg']
                          }}
                          maxFiles={5}
                          onFilesAdded={(files) => handleRoomPhotosAdded(roomType.id, files)}
                          fileType="image"
                          roomType={roomType.id}
                        />

                        {room.photos.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {room.photos.map((file, photoIndex) => (
                              <div key={photoIndex} className="relative group aspect-square rounded-lg overflow-hidden border">
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`${roomType.name} снимка ${photoIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                                    onClick={() => handleDownload(file)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                                    onClick={() => handleRemoveRoomPhoto(roomType.id, photoIndex)}
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
                  );
                })}
              </>
            )}

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setLocation("/evaluation/step1")}>
                Назад
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-[#003366] hover:bg-[#002244]"
                disabled={isScanning || isSubmitting}
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