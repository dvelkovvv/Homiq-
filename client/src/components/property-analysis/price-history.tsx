import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { formatCurrency } from "@/lib/utils";

interface PriceHistoryProps {
  priceHistory: {
    date: string;
    price: number;
  }[];
  currentPrice: number;
}

export function PriceHistory({ priceHistory, currentPrice }: PriceHistoryProps) {
  const chartData = {
    labels: priceHistory.map(entry => new Date(entry.date).toLocaleDateString('bg-BG')),
    datasets: [
      {
        label: 'Историческа цена',
        data: priceHistory.map(entry => entry.price),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4
      },
      {
        label: 'Текуща оценка',
        data: Array(priceHistory.length).fill(currentPrice),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderDash: [5, 5],
        tension: 0
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Цена (EUR)'
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          История на цените
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
