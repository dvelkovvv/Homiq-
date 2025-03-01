import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationFormLayout } from "@/components/evaluation-form-layout";
import { FileText, Info, Clock, Building2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DocumentScanner } from "@/components/document-scanner";
import { FileUploadZone } from "@/components/file-upload-zone";
import { motion } from "framer-motion";

type EvaluationType = 'quick' | 'licensed';

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
  const [evaluationType, setEvaluationType] = useState<EvaluationType>('quick');
  const [documentsStatus, setDocumentsStatus] = useState<DocumentStatus>({
    notary_act: false,
    sketch: false,
    tax_assessment: false
  });
  const [photos, setPhotos] = useState<RoomPhoto[]>([]);
  const [extractedDocumentData, setExtractedDocumentData] = useState<any[]>([]);

  const handleScanComplete = (text: string, data: any) => {
    if (data) {
      setExtractedDocumentData(prev => [...prev, data]);

      if (data.documentType) {
        setDocumentsStatus(prev => ({
          ...prev,
          [data.documentType]: true
        }));
      }

      toast({
        title: "Документът е обработен",
        description: "Успешно извлечени данни"
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
      title: "Снимките са добавени",
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
    }

    localStorage.setItem('propertyData', JSON.stringify({
      ...JSON.parse(localStorage.getItem('propertyData') || '{}'),
      evaluationType,
      photos: photos.map(p => p.preview),
      extractedDocumentData
    }));

    localStorage.setItem('currentStep', '3');
    setLocation('/evaluation/step3');
  };

  return (
    <EvaluationFormLayout
      title="Изберете тип оценка"
      onBack={() => setLocation("/evaluation/step1")}
      onNext={handleContinue}
      nextLabel="Продължи"
    >
      <Tabs 
        defaultValue={evaluationType} 
        onValueChange={(value) => setEvaluationType(value as EvaluationType)} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 h-auto p-2 gap-2">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <TabsTrigger 
              value="quick" 
              className="flex flex-col items-center gap-3 py-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Clock className="h-8 w-8" />
              </motion.div>
              <div className="text-center">
                <div className="font-medium text-lg">Бърза оценка</div>
                <div className="text-sm opacity-90">Безплатно • Веднага</div>
              </div>
            </TabsTrigger>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <TabsTrigger 
              value="licensed" 
              className="flex flex-col items-center gap-3 py-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full w-full"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <FileText className="h-8 w-8" />
              </motion.div>
              <div className="text-center">
                <div className="font-medium text-lg">Лицензирана оценка</div>
                <div className="text-sm opacity-90">199 лв. • До 3 дни</div>
              </div>
            </TabsTrigger>
          </motion.div>
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
                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Clock className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium">Моментална оценка</div>
                    <div className="text-sm text-muted-foreground">
                      Резултат веднага след въвеждане на данните
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Building2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium">Пазарен анализ</div>
                    <div className="text-sm text-muted-foreground">
                      Сравнение с актуални цени на подобни имоти
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Building2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <div className="font-medium">Локация и инфраструктура</div>
                    <div className="text-sm text-muted-foreground">
                      Отчитане на местоположението и развитието на района
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Важно</div>
                    <div className="text-sm text-blue-700 mt-1">
                      Оценката е ориентировъчна. За официални цели (банков кредит, нотариус) е необходима лицензирана оценка.
                    </div>
                  </div>
                </div>
              </motion.div>
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`p-6 rounded-lg border transition-all ${
                    documentsStatus.notary_act 
                      ? 'bg-green-50 border-green-200' 
                      : 'border-border hover:border-primary hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Нотариален акт</h3>
                  </div>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="notary_act"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`p-6 rounded-lg border transition-all ${
                    documentsStatus.sketch 
                      ? 'bg-green-50 border-green-200' 
                      : 'border-border hover:border-primary hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Скица</h3>
                  </div>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="sketch"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`p-6 rounded-lg border transition-all ${
                    documentsStatus.tax_assessment 
                      ? 'bg-green-50 border-green-200' 
                      : 'border-border hover:border-primary hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Данъчна оценка</h3>
                  </div>
                  <DocumentScanner
                    onScanComplete={handleScanComplete}
                    expectedType="tax_assessment"
                  />
                </motion.div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <FileUploadZone
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg']
                  }}
                  maxFiles={10}
                  onFilesAdded={handlePhotosAdded}
                  fileType="image"
                />
              </motion.div>

              <AnimatePresence>
                {photos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                  >
                    {photos.map((photo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="relative group aspect-square rounded-lg overflow-hidden border"
                      >
                        <img
                          src={photo.preview}
                          alt={`Снимка ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            className="h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-blue-900">Съвети за по-добра оценка</div>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1.5">
                      <motion.li 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Building2 className="h-4 w-4" />
                        Снимайте при добра осветеност
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Building2 className="h-4 w-4" />
                        Включете всички основни помещения
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                      >
                        <Building2 className="h-4 w-4" />
                        Покажете общото състояние на имота
                      </motion.li>
                      <motion.li 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                      >
                        <Building2 className="h-4 w-4" />
                        Добавете снимки на обзавеждането
                      </motion.li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </EvaluationFormLayout>
  );
}