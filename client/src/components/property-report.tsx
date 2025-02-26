import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Home, MapPin, Building2, User, Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { DocumentConfidence } from "./property-analysis/document-confidence";
import { PriceHistory } from "./property-analysis/price-history";
import { motion } from "framer-motion";

interface PropertyReportProps {
  propertyData: any;
  evaluationType: string;
}

export function PropertyReport({ propertyData, evaluationType }: PropertyReportProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [documentAnalysis, setDocumentAnalysis] = useState<{
    confidence: number;
    issues: string[];
    recommendations: string[];
  }>({
    confidence: 0,
    issues: [],
    recommendations: []
  });

  useEffect(() => {
    const urls: string[] = [];
    if (propertyData.roomPhotos && Array.isArray(propertyData.roomPhotos)) {
      propertyData.roomPhotos.forEach((room: any) => {
        if (room && room.photos && Array.isArray(room.photos)) {
          room.photos.forEach((photo: File) => {
            try {
              const url = URL.createObjectURL(photo);
              urls.push(url);
            } catch (error) {
              console.error('Error creating URL for photo:', error);
            }
          });
        }
      });
    }

    setPhotoUrls(urls);

    // Анализ на документите
    if (propertyData.documents && Array.isArray(propertyData.documents)) {
      let totalConfidence = 0;
      const issues: string[] = [];
      const recommendations: string[] = [];

      propertyData.documents.forEach((doc: any) => {
        if (doc.extractedData) {
          // Проверка за несъответствия
          if (doc.extractedData.squareMeters !== propertyData.squareMeters) {
            issues.push(`Несъответствие в квадратурата между документите`);
          }
          if (doc.extractedData.address && doc.extractedData.address !== propertyData.address) {
            issues.push(`Несъответствие в адреса между документите`);
          }

          // Проверка за липсваща информация
          if (!doc.extractedData.documentDate) {
            recommendations.push(`Препоръчва се да се добави дата на документа`);
          }
          if (!doc.extractedData.owner) {
            recommendations.push(`Препоръчва се да се добави информация за собственика`);
          }

          // Изчисляване на увереност в анализа
          totalConfidence += doc.extractedData.confidence || 0;
        }
      });

      setDocumentAnalysis({
        confidence: totalConfidence / propertyData.documents.length,
        issues,
        recommendations
      });
    }

    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [propertyData]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Обобщен доклад за имота
          </CardTitle>
          <CardDescription>
            {evaluationType === 'quick' ?
              'Бърза оценка базирана на основни параметри' :
              'Детайлна лицензирана оценка с пълен анализ'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Основна информация */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg border p-4"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Основна информация
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Тип имот</p>
                  <p className="font-medium">
                    {propertyData.type === 'apartment' ? 'Апартамент' :
                      propertyData.type === 'house' ? 'Къща' :
                        propertyData.type === 'villa' ? 'Вила' : 'Земеделска земя'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Площ</p>
                  <p className="font-medium">{propertyData.squareMeters} кв.м</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Адрес</p>
                  <p className="font-medium">{propertyData.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Година на строителство</p>
                  <p className="font-medium">{propertyData.constructionYear || 'Не е посочена'}</p>
                </div>
                {propertyData.floor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Етаж</p>
                    <p className="font-medium">{propertyData.floor}</p>
                  </div>
                )}
                {propertyData.totalFloors && (
                  <div>
                    <p className="text-sm text-muted-foreground">Общо етажи</p>
                    <p className="font-medium">{propertyData.totalFloors}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Анализ на документи */}
            {propertyData.documents && propertyData.documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-6"
              >
                <DocumentConfidence
                  documents={propertyData.documents}
                  confidence={documentAnalysis.confidence}
                />

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Преглед на документите
                  </h3>

                  <div className="space-y-4">
                    {propertyData.documents.map((doc: any, index: number) => (
                      <div key={index} className="p-4 rounded-lg bg-accent/5">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="font-medium">
                              {doc.type === 'notary_act' ? 'Нотариален акт' :
                                doc.type === 'sketch' ? 'Скица' : 'Данъчна оценка'}
                            </span>
                          </div>
                          {doc.extractedData?.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        {doc.extractedData && (
                          <div className="grid gap-2 text-sm">
                            {doc.extractedData.documentDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Дата: </span>
                                <span>{doc.extractedData.documentDate}</span>
                              </div>
                            )}
                            {doc.extractedData.squareMeters && (
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Площ: </span>
                                <span>{doc.extractedData.squareMeters} кв.м</span>
                              </div>
                            )}
                            {doc.extractedData.owner && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Собственик: </span>
                                <span>{doc.extractedData.owner}</span>
                              </div>
                            )}
                            {doc.extractedData.scanDate && (
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Сканиран на: </span>
                                <span>{new Date(doc.extractedData.scanDate).toLocaleDateString('bg-BG')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Несъответствия и препоръки */}
                  {(documentAnalysis.issues.length > 0 || documentAnalysis.recommendations.length > 0) && (
                    <div className="mt-6 space-y-4">
                      {documentAnalysis.issues.length > 0 && (
                        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                          <h4 className="font-medium text-yellow-800 mb-2">Открити несъответствия:</h4>
                          <ul className="space-y-1">
                            {documentAnalysis.issues.map((issue, index) => (
                              <li key={index} className="text-sm text-yellow-700 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {documentAnalysis.recommendations.length > 0 && (
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <h4 className="font-medium text-blue-800 mb-2">Препоръки:</h4>
                          <ul className="space-y-1">
                            {documentAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* История на цените */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PriceHistory
                priceHistory={propertyData.priceHistory || []}
                currentPrice={propertyData.estimatedValue || 0}
              />
            </motion.div>

            {/* Снимки и визуална информация */}
            {propertyData.roomPhotos && propertyData.roomPhotos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="rounded-lg border p-4"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Снимки на помещенията
                </h3>
                <div className="space-y-6">
                  {propertyData.roomPhotos.map((room: any, roomIndex: number) => {
                    const startPhotoIndex = propertyData.roomPhotos
                      .slice(0, roomIndex)
                      .reduce((acc: number, r: any) => acc + (r.photos?.length || 0), 0);

                    return (
                      <div key={roomIndex} className="p-4 rounded-lg bg-accent/5">
                        <div className="flex items-center gap-2 mb-2">
                          <Home className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {room.roomType === 'entrance' ? 'Входна врата' :
                              room.roomType === 'kitchen' ? 'Кухня' :
                                room.roomType === 'living' ? 'Хол' :
                                  room.roomType === 'bathroom' ? 'Баня' : 'Спалня'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{room.description}</p>
                        {room.photos && room.photos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {room.photos.map((photo: File, index: number) => (
                              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-accent/5">
                                <img
                                  src={photoUrls[startPhotoIndex + index]}
                                  alt={`${room.roomType} снимка ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Оценка на имота */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="rounded-lg border p-4"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Оценка на имота
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Приблизителна пазарна стойност</p>
                  <p className="font-medium text-xl">€{propertyData.estimatedValue?.toLocaleString() || 'Не е изчислена'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Точност на оценката</p>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.round((propertyData.confidence || 0) * 100)} className="flex-1" />
                    <span className="font-medium">{Math.round((propertyData.confidence || 0) * 100)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Инвестиционен рейтинг</p>
                  <p className="font-medium">{propertyData.investmentRating || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Локация (от 10)</p>
                  <p className="font-medium">{propertyData.locationScore?.toString() || '-'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}