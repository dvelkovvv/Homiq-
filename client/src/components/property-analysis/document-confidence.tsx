import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DocumentConfidenceProps {
  documents: any[];
  confidence: number;
}

export function DocumentConfidence({ documents, confidence }: DocumentConfidenceProps) {
  // Prepare data for the confidence trend chart
  const chartData = {
    labels: documents.map((doc: any) => doc.type === 'notary_act' ? 'Нотариален акт' : doc.type === 'sketch' ? 'Скица' : 'Данъчна оценка'),
    datasets: [
      {
        label: 'Достоверност на документите',
        data: documents.map((doc: any) => (doc.extractedData?.confidence || 0) * 100),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Достоверност: ${context.parsed.y.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Достоверност (%)'
        }
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Анализ на достоверността
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Обща достоверност</span>
              <span className="font-medium">{Math.round(confidence * 100)}%</span>
            </div>
            <Progress 
              value={confidence * 100} 
              className="h-2"
              indicatorClassName={`${
                confidence > 0.7 ? 'bg-green-500' :
                confidence > 0.4 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
            />
          </div>
          
          <div className="h-[200px]">
            <Line data={chartData} options={options} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
