import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProgressSteps } from "@/components/progress-steps";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

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
  const evaluationType = params.get('evaluationType') || 'quick';

  // Mock evaluation data
  const mockEvaluation = {
    estimatedValue: Math.floor(Math.random() * (500000 - 100000) + 100000),
    confidence: Math.random() * (0.95 - 0.75) + 0.75,
    currency: "EUR",
    evaluationType: evaluationType,
    status: "completed"
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('bg-BG', {
      style: 'currency',
      currency: mockEvaluation.currency,
      maximumFractionDigits: 0
    });
  };

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
                    {formatCurrency(mockEvaluation.estimatedValue)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Приблизителна пазарна стойност
                  </p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Точност на оценката: {Math.round(mockEvaluation.confidence * 100)}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Тип оценка: {mockEvaluation.evaluationType === 'quick' ? 'Бърза' : 'Лицензирана'}
                    </p>
                  </div>
                  <div className="mt-8">
                    <Button 
                      onClick={() => navigate("/")}
                      className="bg-[#003366] hover:bg-[#002244]"
                    >
                      Към начало
                    </Button>
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