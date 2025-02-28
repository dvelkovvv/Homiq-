import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationFormLayout } from "@/components/evaluation-form-layout";
import { FileText, MapPin, CheckCircle, Clock, AlertTriangle, Image as ImageIcon, Info } from "lucide-react";
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

interface EvaluationType {
  key: 'quick' | 'licensed';
  title: string;
  description: string;
  features: string[];
  price: string;
  timeframe: string;
  icon: React.ComponentType<any>;
}

const EVALUATION_TYPES: EvaluationType[] = [
  {
    key: 'quick',
    title: 'Бърза оценка',
    description: 'Автоматична оценка базирана на въведените данни и локация',
    features: [
      'Моментална оценка',
      'Базирана на пазарни данни',
      'Сравнителен анализ с подобни имоти',
      'Анализ на локацията',
      'Достъп до историческите данни'
    ],
    price: 'Безплатно',
    timeframe: 'Веднага',
    icon: MapPin
  },
  {
    key: 'licensed',
    title: 'Лицензирана оценка',
    description: 'Пълен професионален анализ от лицензиран оценител',
    features: [
      'Детайлен оглед на имота',
      'Анализ на всички документи',
      'Правен анализ на собствеността',
      'Оценка на състоянието и обзавеждането',
      'Официален оценителски доклад'
    ],
    price: '199 лв.',
    timeframe: '2-3 работни дни',
    icon: FileText
  }
];

export default function Step2() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<'quick' | 'licensed' | null>(null);
  const [activeTab, setActiveTab] = useState("documents");
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
    if (!selectedType) {
      toast({
        title: "Изберете тип оценка",
        description: "Моля, изберете един от предложените варианти за оценка",
        variant: "destructive"
      });
      return;
    }

    if (selectedType === 'licensed') {
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
      evaluationType: selectedType
    }));

    localStorage.setItem('currentStep', '3');
    setLocation('/evaluation/step3');
  };

  return (
    <EvaluationFormLayout
      title="Изберете тип оценка"
      onBack={() => setLocation("/evaluation/step1")}
      onNext={handleContinue}
      nextLabel={selectedType === 'licensed' ? 'Продължи със снимките и документите' : 'Продължи към оценка'}
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {EVALUATION_TYPES.map((type) => (
            <Card 
              key={type.key}
              className={`cursor-pointer transition-all hover:border-primary ${
                selectedType === type.key ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedType(type.key)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <type.icon className="h-5 w-5 text-primary" />
                    <CardTitle>{type.title}</CardTitle>
                  </div>
                  {selectedType === type.key && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {type.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between items-center border-t pt-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{type.timeframe}</span>
                </div>
                <div className="font-medium text-lg">
                  {type.price}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {selectedType === 'licensed' && (
          <div className="space-y-6">
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
          </div>
        )}

        {selectedType === 'quick' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Важно за бързата оценка</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Бързата оценка е ориентировъчна и се базира на автоматичен анализ на пазарни данни. 
                  За официални цели (банков кредит, нотариус и др.) е необходима лицензирана оценка.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </EvaluationFormLayout>
  );
}