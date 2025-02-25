import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Home, MapPin, Building2, User } from "lucide-react";

interface PropertyReportProps {
  propertyData: any;
  evaluationType: string;
}

export function PropertyReport({ propertyData, evaluationType }: PropertyReportProps) {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    // Създаваме URL обекти за всички снимки
    const urls: string[] = [];
    if (propertyData.roomPhotos) {
      propertyData.roomPhotos.forEach((room: any) => {
        if (room.photos) {
          room.photos.forEach((photo: File) => {
            const url = URL.createObjectURL(photo);
            urls.push(url);
          });
        }
      });
    }
    setPhotoUrls(urls);

    // Почистване при размонтиране
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [propertyData.roomPhotos]);

  return (
    <div className="space-y-6 w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Обобщен доклад за имота
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Основна информация */}
            <div className="rounded-lg border p-4">
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
            </div>

            {/* Документи */}
            {propertyData.documents && propertyData.documents.length > 0 && (
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Анализ на документите
                </h3>
                <div className="space-y-4">
                  {propertyData.documents.map((doc: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-accent/5">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium">
                          {doc.type === 'notary_act' ? 'Нотариален акт' :
                           doc.type === 'sketch' ? 'Скица' : 'Данъчна оценка'}
                        </span>
                      </div>
                      {doc.extractedData && (
                        <div className="grid gap-2 text-sm">
                          {doc.extractedData.documentDate && (
                            <div>
                              <span className="text-muted-foreground">Дата: </span>
                              <span>{doc.extractedData.documentDate}</span>
                            </div>
                          )}
                          {doc.extractedData.squareMeters && (
                            <div>
                              <span className="text-muted-foreground">Площ: </span>
                              <span>{doc.extractedData.squareMeters} кв.м</span>
                            </div>
                          )}
                          {doc.extractedData.owner && (
                            <div>
                              <span className="text-muted-foreground">Собственик: </span>
                              <span>{doc.extractedData.owner}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Снимки */}
            {propertyData.roomPhotos && propertyData.roomPhotos.length > 0 && (
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Снимки на помещенията
                </h3>
                <div className="space-y-6">
                  {propertyData.roomPhotos.map((room: any, index: number) => (
                    <div key={index} className="p-4 rounded-lg bg-accent/5">
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
                          {room.photos.map((photo: File, photoIndex: number) => {
                            const urlIndex = propertyData.roomPhotos
                              .slice(0, index)
                              .reduce((acc: number, r: any) => acc + (r.photos?.length || 0), 0) + photoIndex;
                            return (
                              <div key={photoIndex} className="aspect-square rounded-lg overflow-hidden bg-accent/5">
                                <img
                                  src={photoUrls[urlIndex]}
                                  alt={`${room.roomType} снимка ${photoIndex + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Оценка */}
            <div className="rounded-lg border p-4">
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}