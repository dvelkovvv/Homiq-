import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Download, Share2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PropertyReportProps {
  propertyData: any;
  evaluationType: string;
}

export function PropertyReport({ propertyData, evaluationType }: PropertyReportProps) {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const generatePDF = async () => {
    try {
      setGeneratingPdf(true);
      const doc = new jsPDF();

      // Заглавна страница
      doc.setFontSize(24);
      doc.text("Доклад за оценка на имот", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Дата: ${new Date().toLocaleDateString('bg-BG')}`, 20, 40);
      doc.text(`Тип оценка: ${evaluationType === 'quick' ? 'Бърза оценка' : 'Лицензирана оценка'}`, 20, 50);

      // Основна информация
      doc.addPage();
      doc.setFontSize(16);
      doc.text("1. Основна информация за имота", 20, 20);
      
      const basicInfo = [
        ["Тип имот", propertyData.type === 'apartment' ? 'Апартамент' : 
                     propertyData.type === 'house' ? 'Къща' : 
                     propertyData.type === 'villa' ? 'Вила' : 'Земеделска земя'],
        ["Площ", `${propertyData.squareMeters} кв.м`],
        ["Адрес", propertyData.address],
        ["Година на строителство", propertyData.constructionYear || 'Не е посочена'],
        ["Етаж", propertyData.floor || 'Не е приложимо'],
        ["Общо етажи", propertyData.totalFloors || 'Не е приложимо']
      ];

      autoTable(doc, {
        startY: 30,
        head: [["Характеристика", "Стойност"]],
        body: basicInfo,
        theme: 'striped',
        styles: { fontSize: 12, cellPadding: 5 }
      });

      // Документи
      if (propertyData.documents && propertyData.documents.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("2. Анализ на документите", 20, 20);

        const documentsInfo = propertyData.documents.map((doc: any) => [
          doc.type === 'notary_act' ? 'Нотариален акт' :
          doc.type === 'sketch' ? 'Скица' : 'Данъчна оценка',
          doc.extractedData?.documentDate || 'Няма дата',
          doc.extractedData?.squareMeters ? `${doc.extractedData.squareMeters} кв.м` : '-'
        ]);

        autoTable(doc, {
          startY: 30,
          head: [["Тип документ", "Дата", "Площ"]],
          body: documentsInfo,
          theme: 'striped',
          styles: { fontSize: 12, cellPadding: 5 }
        });
      }

      // Снимки
      if (propertyData.roomPhotos && propertyData.roomPhotos.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("3. Фотографии на помещенията", 20, 20);

        const roomsInfo = propertyData.roomPhotos.map((room: any) => [
          room.roomType === 'entrance' ? 'Входна врата' :
          room.roomType === 'kitchen' ? 'Кухня' :
          room.roomType === 'living' ? 'Хол' :
          room.roomType === 'bathroom' ? 'Баня' : 'Спалня',
          room.description,
          `${room.photos.length} бр.`
        ]);

        autoTable(doc, {
          startY: 30,
          head: [["Помещение", "Описание", "Брой снимки"]],
          body: roomsInfo,
          theme: 'striped',
          styles: { fontSize: 12, cellPadding: 5 }
        });
      }

      // Оценка
      doc.addPage();
      doc.setFontSize(16);
      doc.text("4. Оценка на имота", 20, 20);

      const evaluationInfo = [
        ["Приблизителна пазарна стойност", `€${propertyData.estimatedValue?.toLocaleString() || 'Не е изчислена'}`],
        ["Точност на оценката", `${Math.round((propertyData.confidence || 0) * 100)}%`],
        ["Инвестиционен рейтинг", propertyData.investmentRating || '-'],
        ["Локация (от 10)", propertyData.locationScore?.toString() || '-']
      ];

      autoTable(doc, {
        startY: 30,
        head: [["Показател", "Стойност"]],
        body: evaluationInfo,
        theme: 'striped',
        styles: { fontSize: 12, cellPadding: 5 }
      });

      // Запазване на PDF
      doc.save(`property-report-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Докладът е генериран успешно",
        description: "PDF файлът е запазен на вашето устройство.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Грешка при генериране на доклада",
        description: "Моля, опитайте отново.",
        variant: "destructive"
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={generatePDF}
        disabled={generatingPdf}
        className="bg-[#003366] hover:bg-[#002244]"
      >
        {generatingPdf ? (
          "Генериране..."
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Изтегли доклад
          </>
        )}
      </Button>
      <Button variant="outline">
        <Share2 className="mr-2 h-4 w-4" />
        Сподели
      </Button>
    </div>
  );
}
