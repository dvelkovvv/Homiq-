import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/logo";
import { FileText, Image as ImageIcon, Info, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ProgressSteps } from "@/components/progress-steps";
import { DocumentScanner } from "@/components/document-scanner";
import { FileUploadZone } from "@/components/file-upload-zone";

const STEPS = [
  {
    title: "Основна информация",
    description: "Въведете детайли за имота"
  },
  {
    title: "Документи и снимки",
    description: "Качете необходимите файлове"
  },
  {
    title: "Оценка",
    description: "Преглед на резултатите"
  }
];

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");
  const [documentsStatus, setDocumentsStatus] = useState<DocumentStatus>({
    notary_act: false,
    sketch: false,
    tax_assessment: false
  });
  const [photos, setPhotos] = useState<RoomPhoto[]>([]);

  const handleScanComplete = (text: string, data: any) => {
    if (data) {
      // Get existing property data
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');

      // Update documents array
      const documents = propertyData.documents || [];
      documents.push({
        type: data.documentType,
        extractedData: data,
        text: text,
        scannedAt: new Date().toISOString()
      });

      // Save updated data
      localStorage.setItem('propertyData', JSON.stringify({
        ...propertyData,
        documents
      }));

      // Update status
      if (data.documentType) {
        setDocumentsStatus(prev => ({
          ...prev,
          [data.documentType]: true
        }));
      }

      toast({
        title: "Документът е обработен успешно",
        description: "Данните са извлечени и запазени."
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

  const handleContinue = async () => {
    try {
      setIsSubmitting(true);

      // Save photos to propertyData
      const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
      localStorage.setItem('propertyData', JSON.stringify({
        ...propertyData,
        photos: photos.map(p => p.file)
      }));

      localStorage.setItem('currentStep', '3');
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
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ProgressSteps currentStep={2} steps={STEPS} />

        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Документи
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Снимки
              </TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Необходими документи</CardTitle>
                  <CardDescription>
                    За точна оценка на имота са необходими следните документи
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
                      <p className="text-sm text-muted-foreground mb-4">
                        Основен документ за собственост, съдържащ детайли за имота
                      </p>
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
                      <p className="text-sm text-muted-foreground mb-4">
                        Документ от кадастъра с точни размери и разположение
                      </p>
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
                      <p className="text-sm text-muted-foreground mb-4">
                        Актуална данъчна оценка на имота
                      </p>
                      <DocumentScanner
                        onScanComplete={handleScanComplete}
                        expectedType="tax_assessment"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Важна информация</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Качете ясни снимки или сканирани копия на документите. 
                          Системата ще извлече автоматично важната информация от тях.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Снимки на имота</CardTitle>
                  <CardDescription>
                    Добавете качествени снимки на имота за по-точна оценка
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
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800">Съвети за снимките</h4>
                        <ul className="text-sm text-blue-700 mt-1 space-y-1">
                          <li>• Снимайте при добра осветеност</li>
                          <li>• Включете всички важни помещения</li>
                          <li>• Покажете общото състояние на имота</li>
                          <li>• Добавете снимки на обзавеждането, ако е включено в цената</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setLocation("/evaluation/step1")}>
              Назад
            </Button>
            <Button
              onClick={handleContinue}
              className="bg-[#003366] hover:bg-[#002244]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Обработка..." : "Продължи"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}