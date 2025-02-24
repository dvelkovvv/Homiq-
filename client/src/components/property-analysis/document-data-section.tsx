import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Home, Calendar, Construction, CreditCard } from "lucide-react";

interface DocumentDataSectionProps {
  extractedData: any;
  documentAnalysis?: any;
}

export function DocumentDataSection({ extractedData, documentAnalysis }: DocumentDataSectionProps) {
  if (!extractedData && !documentAnalysis) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Основни данни */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Home className="inline-block w-4 h-4 mr-2" />
            Основни данни
          </CardTitle>
          <Badge variant="outline">Имот</Badge>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            {extractedData?.address && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Адрес</dt>
                <dd className="text-sm">{extractedData.address}</dd>
              </div>
            )}
            {extractedData?.squareMeters && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Площ</dt>
                <dd className="text-sm">{extractedData.squareMeters} кв.м</dd>
              </div>
            )}
            {documentAnalysis?.extractedData?.cadastralNumber && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Кадастрален номер</dt>
                <dd className="text-sm">{documentAnalysis.extractedData.cadastralNumber}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Технически характеристики */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Construction className="inline-block w-4 h-4 mr-2" />
            Технически данни
          </CardTitle>
          <Badge variant="outline">Строителство</Badge>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            {extractedData?.constructionType && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Конструкция</dt>
                <dd className="text-sm">{extractedData.constructionType}</dd>
              </div>
            )}
            {extractedData?.constructionYear && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Година на строеж</dt>
                <dd className="text-sm">{extractedData.constructionYear}</dd>
              </div>
            )}
            {documentAnalysis?.extractedData?.buildingRights && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Застрояване</dt>
                <dd className="text-sm">{documentAnalysis.extractedData.buildingRights}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Правни данни */}
      {documentAnalysis?.type === 'notary_act' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <FileText className="inline-block w-4 h-4 mr-2" />
              Правни данни
            </CardTitle>
            <Badge variant="outline">Нотариален акт</Badge>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Тип документ</dt>
                <dd className="text-sm">Нотариален акт</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Точност на анализа</dt>
                <dd className="text-sm">{Math.round(documentAnalysis.confidence * 100)}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Данъчна информация */}
      {(documentAnalysis?.type === 'tax_assessment' || extractedData?.taxAssessment) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <CreditCard className="inline-block w-4 h-4 mr-2" />
              Данъчна информация
            </CardTitle>
            <Badge variant="outline">Данъчна оценка</Badge>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {extractedData?.taxAssessment && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Данъчна оценка</dt>
                  <dd className="text-sm">{extractedData.taxAssessment.toLocaleString()} лв.</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
