import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EvaluationFormLayout } from "@/components/evaluation-form-layout";
import { FileText, Image as ImageIcon, MapPin, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const STEPS = [
  {
    title: "Основна информация",
    description: "Въведете детайли за имота"
  },
  {
    title: "Тип оценка",
    description: "Изберете вид на оценката"
  },
  {
    title: "Резултат",
    description: "Преглед на оценката"
  }
];

interface EvaluationType {
  key: 'quick' | 'licensed';
  title: string;
  description: string;
  features: string[];
  price: string;
  timeframe: string;
  icon: React.ComponentType<any>;
}

const EVALUATION_TYPES: EvaluationType[] = [
  {
    key: 'quick',
    title: 'Бърза оценка',
    description: 'Автоматична оценка базирана на въведените данни и локация',
    features: [
      'Моментална оценка',
      'Базирана на пазарни данни',
      'Сравнителен анализ с подобни имоти',
      'Анализ на локацията',
      'Достъп до историческите данни'
    ],
    price: 'Безплатно',
    timeframe: 'Веднага',
    icon: MapPin
  },
  {
    key: 'licensed',
    title: 'Лицензирана оценка',
    description: 'Пълен професионален анализ от лицензиран оценител',
    features: [
      'Детайлен оглед на имота',
      'Анализ на всички документи',
      'Правен анализ на собствеността',
      'Оценка на състоянието и обзавеждането',
      'Официален оценителски доклад'
    ],
    price: '199 лв.',
    timeframe: '2-3 работни дни',
    icon: FileText
  }
];

export default function Step2() {
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<'quick' | 'licensed' | null>(null);

  const handleContinue = () => {
    if (!selectedType) {
      toast({
        title: "Изберете тип оценка",
        description: "Моля, изберете един от предложените варианти за оценка",
        variant: "destructive"
      });
      return;
    }

    // Запазваме избрания тип
    const propertyData = JSON.parse(localStorage.getItem('propertyData') || '{}');
    localStorage.setItem('propertyData', JSON.stringify({
      ...propertyData,
      evaluationType: selectedType
    }));

    localStorage.setItem('currentStep', '3');
    setLocation('/evaluation/step3');
  };

  return (
    <EvaluationFormLayout
      title="Изберете тип оценка"
      onBack={() => setLocation("/evaluation/step1")}
      onNext={handleContinue}
      nextLabel="Продължи"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {EVALUATION_TYPES.map((type) => (
          <Card 
            key={type.key}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedType === type.key ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedType(type.key)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <type.icon className="h-5 w-5 text-primary" />
                  <CardTitle>{type.title}</CardTitle>
                </div>
                {selectedType === type.key && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {type.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{type.timeframe}</span>
              </div>
              <div className="font-medium text-lg">
                {type.price}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedType === 'quick' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">Важно за бързата оценка</h4>
              <p className="text-sm text-blue-700 mt-1">
                Бързата оценка е ориентировъчна и се базира на автоматичен анализ на пазарни данни. 
                За официални цели (банков кредит, нотариус и др.) е необходима лицензирана оценка.
              </p>
            </div>
          </div>
        </div>
      )}
    </EvaluationFormLayout>
  );
}