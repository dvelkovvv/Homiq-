import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { HelpCircle, Image as ImageIcon, Download, X, Clock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { DocumentScanner } from "@/components/document-scanner";
import { Info } from "lucide-react";
import { InstructionCard } from "@/components/instruction-card";
import { Spinner } from "@/components/ui/spinner";
import { FileUploadZone } from "@/components/file-upload-zone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  roomNumber: number;
  photos: File[];
  description: string;
}

export default function Step2() {
  const [, navigate] = useLocation();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState<string>("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([]);
  const [roomPhotos, setRoomPhotos] = useState<RoomPhotos[]>([]);
  const [evaluationType, setEvaluationType] = useState<"quick" | "licensed">("quick");

  const propertyId = new URLSearchParams(window.location.search).get('propertyId');
  const rooms = parseInt(new URLSearchParams(window.location.search).get('rooms') || '0');

  useEffect(() => {
    if (!propertyId) {
      navigate('/evaluation/step1');
      return;
    }

    // Initialize room photos array based on number of rooms
    if (rooms > 0 && roomPhotos.length === 0) {
      setRoomPhotos(
        Array.from({ length: rooms }, (_, i) => ({
          roomNumber: i + 1,
          photos: [],
          description: `Стая ${i + 1}`
        }))
      );
    }
  }, [propertyId, navigate, rooms]);

  const handleScanComplete = (text: string, data: any) => {
    setIsScanning(false);
    setScannedText(text);
    setExtractedData(data);
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

  const handleRoomPhotosAdded = (roomNumber: number, files: File[]) => {
    setRoomPhotos(prev => prev.map(room =>
      room.roomNumber === roomNumber
        ? { ...room, photos: [...room.photos, ...files] }
        : room
    ));
    toast({
      title: `Снимките за стая ${roomNumber} са качени успешно`,
      description: `${files.length} ${files.length === 1 ? 'снимка е добавена' : 'снимки са добавени'}`,
    });
  };

  const handleRoomDescriptionChange = (roomNumber: number, description: string) => {
    setRoomPhotos(prev => prev.map(room =>
      room.roomNumber === roomNumber
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

  const handleRemoveRoomPhoto = (roomNumber: number, photoIndex: number) => {
    setRoomPhotos(prev => prev.map(room =>
      room.roomNumber === roomNumber
        ? { ...room, photos: room.photos.filter((_, i) => i !== photoIndex) }
        : room
    ));
  };

  const handleRemoveDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    try {
      const formData = new FormData();
      uploadedImages.forEach(file => formData.append('images', file));
      uploadedDocuments.forEach(file => formData.append('documents', file));

      // Prepare room photos data
      const roomPhotosData = roomPhotos.map(room => ({
        roomNumber: room.roomNumber,
        description: room.description,
        photos: room.photos.map(photo => URL.createObjectURL(photo))
      }));

      const params = new URLSearchParams();
      params.set('propertyId', propertyId!);
      params.set('evaluationType', evaluationType);
      params.set('roomPhotos', JSON.stringify(roomPhotosData));
      if (extractedData) {
        params.set('extractedData', JSON.stringify(extractedData));
      }
      navigate(`/evaluation/step3?${params.toString()}`);
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Възникна проблем при качването на файловете.",
        variant: "destructive"
      });
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
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={2} steps={STEPS} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Изберете тип оценка</CardTitle>
                <CardDescription>
                  Изберете между бърза или лицензирана оценка на имота
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={evaluationType} onValueChange={(value: "quick" | "licensed") => setEvaluationType(value)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="quick" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Бърза оценка
                    </TabsTrigger>
                    <TabsTrigger value="licensed" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Лицензирана оценка
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="quick">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium mb-2">Бърза оценка на имота</h3>
                      <p className="text-sm text-gray-600">
                        Базира се на локацията и основната информация от стъпка 1.
                        Получавате приблизителна оценка веднага.
                      </p>
                    </div>
                  </TabsContent>
                  <TabsContent value="licensed">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium mb-2">Лицензирана оценка на имота</h3>
                      <p className="text-sm text-gray-600">
                        Включва подробен анализ на документи и снимки.
                        Получавате точна оценка от лицензиран оценител.
                      </p>
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
                {/* Document Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Качване на документи</CardTitle>
                    <CardDescription>
                      Качете необходимите документи за точна оценка
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentScanner
                      onScanComplete={handleScanComplete}
                    />
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Препоръчителни документи:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        <li>Скица на имота</li>
                        <li>Нотариален акт</li>
                        <li>Данъчна оценка</li>
                        <li>Други релевантни документи</li>
                      </ul>
                    </div>
                    <FileUploadZone
                      accept={{
                        'application/pdf': ['.pdf'],
                        'image/*': ['.png', '.jpg', '.jpeg']
                      }}
                      maxFiles={5}
                      onFilesAdded={handleDocumentsAdded}
                      fileType="document"
                    />
                    {uploadedDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedDocuments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg border">
                            <span className="text-sm truncate">{file.name}</span>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleDownload(file)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => handleRemoveDocument(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {scannedText && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Извлечен текст и данни:</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{scannedText}</p>
                        {extractedData && (
                          <div className="mt-4 space-y-2">
                            {extractedData.squareMeters && (
                              <p className="text-sm">Квадратура: {extractedData.squareMeters} кв.м</p>
                            )}
                            {extractedData.constructionYear && (
                              <p className="text-sm">Година на строителство: {extractedData.constructionYear}</p>
                            )}
                            {extractedData.address && (
                              <p className="text-sm">Адрес: {extractedData.address}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* General Photos Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Общи снимки на имота</CardTitle>
                    <CardDescription>
                      Качете общи снимки на имота
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

                {/* Room Photos Section */}
                {roomPhotos.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Снимки по стаи</CardTitle>
                      <CardDescription>
                        Качете снимки за всяка стая поотделно
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {roomPhotos.map((room) => (
                          <div key={room.roomNumber} className="border rounded-lg p-4">
                            <h3 className="text-lg font-medium mb-2">Стая {room.roomNumber}</h3>
                            <input
                              type="text"
                              className="w-full mb-4 p-2 border rounded"
                              value={room.description}
                              onChange={(e) => handleRoomDescriptionChange(room.roomNumber, e.target.value)}
                              placeholder="Описание на стаята"
                            />
                            <FileUploadZone
                              accept={{
                                'image/*': ['.png', '.jpg', '.jpeg']
                              }}
                              maxFiles={5}
                              onFilesAdded={(files) => handleRoomPhotosAdded(room.roomNumber, files)}
                              fileType="image"
                            />
                            {room.photos.length > 0 && (
                              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {room.photos.map((file, photoIndex) => (
                                  <div key={photoIndex} className="relative group aspect-square rounded-lg overflow-hidden border">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt={`Room ${room.roomNumber} Photo ${photoIndex + 1}`}
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
                                        onClick={() => handleRemoveRoomPhoto(room.roomNumber, photoIndex)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/evaluation/step1")}>
                Назад
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-[#003366] hover:bg-[#002244]"
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Spinner className="mr-2" />
                    Обработка...
                  </>
                ) : (
                  'Продължи към оценка'
                )}
              </Button>
            </CardFooter>
          </div>

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