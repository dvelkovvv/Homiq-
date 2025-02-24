import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Building2, School, ShoppingCart, Trees } from "lucide-react";

interface NeighborhoodAnalysisProps {
  analysis: {
    score: number;
    amenities: {
      type: string;
      distance: number;
      impact: number;
    }[];
    development: {
      planned: string[];
      impact: number;
    };
    demographics: {
      population: number;
      growth: number;
      income: number;
    };
  };
}

export function NeighborhoodAnalysis({ analysis }: NeighborhoodAnalysisProps) {
  const getAmenityIcon = (type: string) => {
    switch (type) {
      case 'Транспорт':
        return <Building2 className="h-5 w-5 text-blue-500" />;
      case 'Училища':
        return <School className="h-5 w-5 text-green-500" />;
      case 'Магазини':
        return <ShoppingCart className="h-5 w-5 text-purple-500" />;
      case 'Паркове':
        return <Trees className="h-5 w-5 text-emerald-500" />;
      default:
        return <Building2 className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Анализ на района</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{analysis.score}</span>
          <span className="text-sm text-gray-500">/100</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Удобства наблизо</h4>
          {analysis.amenities.map((amenity, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getAmenityIcon(amenity.type)}
                  <span>{amenity.type}</span>
                </div>
                <span className="text-sm">{amenity.distance} км</span>
              </div>
              <Progress value={amenity.impact} className="h-2" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Планирано развитие</h4>
          <div className="space-y-2 bg-gray-50 rounded-lg p-4">
            {analysis.development.planned.map((plan, index) => (
              <p key={index} className="text-sm text-gray-600">{plan}</p>
            ))}
            <p className="text-sm font-medium text-green-600 mt-2">
              +{analysis.development.impact}% очаквано влияние върху стойността
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Население</p>
            <p className="font-medium">{analysis.demographics.population.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Растеж</p>
            <p className="font-medium">{analysis.demographics.growth}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Среден доход</p>
            <p className="font-medium">€{analysis.demographics.income.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
