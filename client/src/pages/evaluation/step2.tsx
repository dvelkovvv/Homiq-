import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationFormLayout } from "@/components/evaluation-form-layout";
import { FileText, Image as ImageIcon, MapPin, CheckCircle, Info, Clock, Building2 } from "lucide-react";
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
      if (!documentsStatus.notary_act || !documentsStatus.sketch) {
        toast({
          title: "Липсващи документи",
          description: "Моля, качете поне нотариален акт и скица на имота",
          variant: "destructive"
        });
        return;
      }

      if (photos.length === 0) {
        toast({
          title: "Липсващи снимки",
          description: "Моля, качете поне една снимка на имота",
          variant: "destructive"
        });
        return;
      }

      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      localStorage.setItem('propertyData', JSON.stringify({
        ...propertyData,
        photos: photos.map(p => p.file)
      }));
    }

    localStorage.setItem('propertyData', JSON.stringify({
      ...JSON.parse(localStorage.getItem('propertyData') || '{}'),
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
        <TabsList className="grid w-full grid-cols-2 h-24 p-2 gap-2">
          <TabsTrigger value="quick" className="flex flex-col items-center gap-3 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MapPin className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium text-base">Бърза оценка</div>
              <div className="text-sm font-normal">Безплатно • Веднага</div>
            </div>
          </TabsTrigger>
          <TabsTrigger value="licensed" className="flex flex-col items-center gap-3 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium text-base">Лицензирана оценка</div>
              <div className="text-sm font-normal">199 лв. • До 3 дни</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Бърза автоматична оценка
              </CardTitle>
              <CardDescription>
                Получавате ориентировъчна оценка на база въведените данни и анализ на пазара
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium">Моментална оценка</div>
                    <div className="text-sm text-muted-foreground">
                      Резултат веднага след въвеждане на данните
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium">Пазарен анализ</div>
                    <div className="text-sm text-muted-foreground">
                      Сравнение с актуални цени на подобни имоти
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium">Локация и инфраструктура</div>
                    <div className="text-sm text-muted-foreground">
                      Отчитане на местоположението и развитието на района
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Важно</div>
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
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Документи за имота
              </CardTitle>
              <CardDescription>
                Качете необходимите документи за професионална оценка
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-lg border transition-colors ${documentsStatus.notary_act ? 'bg-green-50 border-green-200' : 'border-border hover:border-primary'}`}>
                  <div className="flex items-center justify-between mb-3">
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

                <div className={`p-6 rounded-lg border transition-colors ${documentsStatus.sketch ? 'bg-green-50 border-green-200' : 'border-border hover:border-primary'}`}>
                  <div className="flex items-center justify-between mb-3">
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

                <div className={`p-6 rounded-lg border transition-colors ${documentsStatus.tax_assessment ? 'bg-green-50 border-green-200' : 'border-border hover:border-primary'}`}>
                  <div className="flex items-center justify-between mb-3">
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
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Снимки на имота
              </CardTitle>
              <CardDescription>
                Добавете качествени снимки за точна оценка
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FileUploadZone
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg']
                }}
                maxFiles={10}
                onFilesAdded={handlePhotosAdded}
                fileType="image"
              />

              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Съвети за по-добра оценка</div>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1.5">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Снимайте при добра осветеност
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Включете всички основни помещения
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Покажете общото състояние на имота
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Добавете снимки на обзавеждането
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </EvaluationFormLayout>
  );
}