import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationFormLayout } from "@/components/evaluation-form-layout";
import { FileText, Image as ImageIcon, MapPin, CheckCircle, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DocumentScanner } from "@/components/document-scanner";
import { FileUploadZone } from "@/components/file-upload-zone";

interface DocumentStatus {
  notary_act: boolean;
  sketch: boolean;
  tax_assessment: boolean;
}

interface RoomPhoto {
  file: File;
  preview: string;
}

export default function Step2() {
  const [, setLocation] = useLocation();
  const [evaluationType, setEvaluationType] = useState<'quick' | 'licensed'>('quick');
  const [documentsStatus, setDocumentsStatus] = useState<DocumentStatus>({
    notary_act: false,
    sketch: false,
    tax_assessment: false
  });
  const [photos, setPhotos] = useState<RoomPhoto[]>([]);

  const handleScanComplete = (text: string, data: any) => {
    if (data) {
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      const documents = propertyData.documents || [];
      documents.push({
        type: data.documentType,
        extractedData: data,
        text: text,
        scannedAt: new Date().toISOString()
      });

      localStorage.setItem('propertyData', JSON.stringify({
        ...propertyData,
        documents
      }));

      if (data.documentType) {
        setDocumentsStatus(prev => ({
          ...prev,
          [data.documentType]: true
        }));
      }

      toast({
        title: "Документът е обработен успешно",
        description: "Данните са извлечени и запазени"
      });
    }
  };

  const handlePhotosAdded = (files: File[]) => {
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPhotos(prev => [...prev, ...newPhotos]);

    toast({
      title: "Снимките са добавени успешно",
      description: `${files.length} ${files.length === 1 ? 'снимка е добавена' : 'снимки са добавени'}`
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const handleContinue = () => {
    if (evaluationType === 'licensed') {
      // Проверка за задължителни документи
      if (!documentsStatus.notary_act || !documentsStatus.sketch) {
        toast({
          title: "Липсващи документи",
          description: "Моля, качете поне нотариален акт и скица на имота",
          variant: "destructive"
        });
        return;
      }

      // Проверка за снимки
      if (photos.length === 0) {
        toast({
          title: "Липсващи снимки",
          description: "Моля, качете поне една снимка на имота",
          variant: "destructive"
        });
        return;
      }

      // Запазване на снимките
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      localStorage.setItem('propertyData', JSON.stringify({
        ...propertyData,
        photos: photos.map(p => p.file)
      }));
    }

    // Запазваме избрания тип
    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    localStorage.setItem('propertyData', JSON.stringify({
      ...propertyData,
      evaluationType
    }));

    localStorage.setItem('currentStep', '3');
    setLocation('/evaluation/step3');
  };

  return (
    <EvaluationFormLayout
      title="Изберете тип оценка"
      onBack={() => setLocation("/evaluation/step1")}
      onNext={handleContinue}
      nextLabel={evaluationType === 'licensed' ? 'Продължи със документите' : 'Продължи към оценка'}
    >
      <Tabs value={evaluationType} onValueChange={(value: 'quick' | 'licensed') => setEvaluationType(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="quick" className="flex flex-col items-center gap-2 py-3">
            <MapPin className="h-5 w-5" />
            <div>
              <div className="font-medium">Бърза оценка</div>
              <div className="text-xs text-muted-foreground">Безплатно</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="licensed" className="flex flex-col items-center gap-2 py-3">
            <FileText className="h-5 w-5" />
            <div>
              <div className="font-medium">Лицензирана оценка</div>
              <div className="text-xs text-muted-foreground">199 лв.</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Бърза оценка на имота</CardTitle>
              <CardDescription>
                Автоматична оценка базирана на въведените данни
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Моментална оценка</div>
                    <div className="text-sm text-muted-foreground">
                      Получавате оценката веднага след въвеждане на данните
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Анализ на локацията</div>
                    <div className="text-sm text-muted-foreground">
                      Отчитаме развитието на района и близостта до ключови локации
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <div className="font-medium">Пазарни данни</div>
                    <div className="text-sm text-muted-foreground">
                      Сравняваме с актуални цени на подобни имоти в района
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Важно за бързата оценка</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Оценката е ориентировъчна. За официални цели (банков кредит, нотариус) е необходима лицензирана оценка.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licensed" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Документи за имота</CardTitle>
              <CardDescription>
                Качете необходимите документи за оценка
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-lg border ${documentsStatus.notary_act ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Нотариален акт</h3>
                    {documentsStatus.notary_act && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="notary_act"
                  />
                </div>

                <div className={`p-6 rounded-lg border ${documentsStatus.sketch ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Скица</h3>
                    {documentsStatus.sketch && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="sketch"
                  />
                </div>

                <div className={`p-6 rounded-lg border ${documentsStatus.tax_assessment ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Данъчна оценка</h3>
                    {documentsStatus.tax_assessment && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="tax_assessment"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Снимки на имота</CardTitle>
              <CardDescription>
                Добавете качествени снимки на имота
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg']
                }}
                maxFiles={10}
                onFilesAdded={handlePhotosAdded}
                fileType="image"
              />

              {photos.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                      <img
                        src={photo.preview}
                        alt={`Снимка ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white hover:text-white hover:bg-white/20"
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </EvaluationFormLayout>
  );
}