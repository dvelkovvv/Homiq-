import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

interface InvestmentScenariosProps {
  scenarios: {
    conservative: {
      returnRate: number;
      totalReturn: number;
      timeline: number;
    };
    moderate: {
      returnRate: number;
      totalReturn: number;
      timeline: number;
    };
    aggressive: {
      returnRate: number;
      totalReturn: number;
      timeline: number;
    };
  };
}

export function InvestmentScenarios({ scenarios }: InvestmentScenariosProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Инвестиционни сценарии</h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              <span>Консервативен</span>
            </div>
            <span className="font-medium">{scenarios.conservative.returnRate.toFixed(1)}%</span>
          </div>
          <Progress value={scenarios.conservative.returnRate * 5} className="h-2" />
          <p className="text-sm text-gray-500">
            Очаквана възвръщаемост: €{scenarios.conservative.totalReturn.toLocaleString()}
            <span className="text-xs ml-2">за {scenarios.conservative.timeline} години</span>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span>Умерен</span>
            </div>
            <span className="font-medium">{scenarios.moderate.returnRate.toFixed(1)}%</span>
          </div>
          <Progress value={scenarios.moderate.returnRate * 5} className="h-2" />
          <p className="text-sm text-gray-500">
            Очаквана възвръщаемост: €{scenarios.moderate.totalReturn.toLocaleString()}
            <span className="text-xs ml-2">за {scenarios.moderate.timeline} години</span>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <span>Агресивен</span>
            </div>
            <span className="font-medium">{scenarios.aggressive.returnRate.toFixed(1)}%</span>
          </div>
          <Progress value={scenarios.aggressive.returnRate * 5} className="h-2" />
          <p className="text-sm text-gray-500">
            Очаквана възвръщаемост: €{scenarios.aggressive.totalReturn.toLocaleString()}
            <span className="text-xs ml-2">за {scenarios.aggressive.timeline} години</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
