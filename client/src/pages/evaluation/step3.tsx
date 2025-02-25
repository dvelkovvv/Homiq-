import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressSteps } from "@/components/progress-steps";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import type { Evaluation } from "@shared/schema";

const STEPS = [
  {
    title: "Основна информация",
    description: "Въведете детайли за имота"
  },
  {
    title: "Медия файлове",
    description: "Качете снимки и документи"
  },
  {
    title: "Оценка",
    description: "Преглед на резултатите"
  }
];

export default function Step3() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const propertyId = params.get('propertyId');
  const evaluationType = params.get('evaluationType');

  // Fetch evaluation data
  const { data: evaluation, isLoading, error } = useQuery<Evaluation>({
    queryKey: [`/api/evaluations/property/${propertyId}`],
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Progress value={30} className="w-60 h-2 mb-4" />
          <p className="text-gray-500">Изчисляване на оценката...</p>
        </div>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-500">Грешка</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Възникна проблем при зареждането на оценката.</p>
            <Button
              variant="outline"
              onClick={() => navigate('/evaluation/step1')}
              className="mt-4"
            >
              Към начало
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <ProgressSteps steps={STEPS} currentStep={3} />

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Оценка на имота</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    €{evaluation.estimatedValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Приблизителна пазарна стойност
                  </p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Точност на оценката: {Math.round(evaluation.confidence * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Тип оценка: {evaluation.evaluationType === 'quick' ? 'Бърза' : 'Лицензирана'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}