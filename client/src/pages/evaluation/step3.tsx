import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Step3() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Simulate evaluation calculation
    const timer = setTimeout(() => {
      setScore(85);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const chartData = {
    labels: ['Your Property', 'Area Average'],
    datasets: [
      {
        label: 'Estimated Value (EUR)',
        data: [250000, 230000],
        backgroundColor: ['#003366', '#4CAF50'],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Logo />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Property Evaluation Results</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 text-center py-8">
                <Progress value={score} />
                <p>Calculating your property value...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-[#003366]">
                    Estimated Value: €250,000
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Based on current market conditions and property details
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Property Score</h4>
                  <Progress value={score} className="h-4" />
                  <p className="text-sm text-gray-500 mt-1">
                    Your property scores {score}/100 based on location, condition, and market demand
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Value Comparison</h4>
                  <div className="h-[200px]">
                    <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Achievements</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      First Evaluation
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      100 Homiq Points
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Consider minor renovations to increase value</li>
                    <li>Property location is highly desirable</li>
                    <li>Good time to sell based on market trends</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/evaluation/step2")}>
              Back
            </Button>
            <Button onClick={() => navigate("/")}>
              Finish
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
