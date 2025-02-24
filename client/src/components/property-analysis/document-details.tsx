import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentAnalysis } from "@/lib/propertyAIAnalyzer";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle, AlertTriangle } from "lucide-react";

interface DocumentDetailsSectionProps {
  documents: DocumentAnalysis[];
}

export function DocumentDetailsSection({ documents }: DocumentDetailsSectionProps) {
  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return <Badge className="bg-green-500">Висока точност</Badge>;
    }
    if (confidence >= 70) {
      return <Badge className="bg-yellow-500">Добра точност</Badge>;
    }
    return <Badge className="bg-red-500">Ниска точност</Badge>;
  };

  const getDocumentTypeName = (type: DocumentAnalysis['type']): string => {
    const types: Record<DocumentAnalysis['type'], string> = {
      'notary_act': 'Нотариален акт',
      'sketch': 'Скица',
      'tax_assessment': 'Данъчна оценка',
      'other': 'Друг документ'
    };
    return types[type];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Анализ на документи
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {documents.map((doc, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{getDocumentTypeName(doc.type)}</h3>
                {getConfidenceBadge(doc.confidence * 100)}
              </div>
              
              <div className="space-y-2 text-sm">
                {doc.extractedData.squareMeters && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Площ: {doc.extractedData.squareMeters} кв.м</span>
                  </div>
                )}
                
                {doc.extractedData.constructionYear && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Година на строителство: {doc.extractedData.constructionYear}</span>
                  </div>
                )}
                
                {doc.extractedData.constructionType && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Тип конструкция: {doc.extractedData.constructionType}</span>
                  </div>
                )}
                
                {doc.extractedData.address && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Адрес: {doc.extractedData.address}</span>
                  </div>
                )}
                
                {doc.extractedData.cadastralNumber && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Кадастрален номер: {doc.extractedData.cadastralNumber}</span>
                  </div>
                )}
                
                {doc.extractedData.buildingRights && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Параметри на застрояване: {doc.extractedData.buildingRights}</span>
                  </div>
                )}
                
                {doc.extractedData.taxAssessment && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Данъчна оценка: {doc.extractedData.taxAssessment.toLocaleString()} лв.</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {documents.length === 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Няма анализирани документи</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
