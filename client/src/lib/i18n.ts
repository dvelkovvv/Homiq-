import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  bg: {
    translation: {
      property: {
        type: 'Тип имот',
        address: 'Адрес',
        squareMeters: 'Квадратура',
        yearBuilt: 'Година на строеж',
        rooms: 'Брой стаи',
        floor: 'Етаж',
        totalFloors: 'Общо етажи',
        heating: 'Отопление',
        parking: 'Паркинг',
      },
      evaluation: {
        estimatedValue: 'Прогнозна стойност',
        confidence: 'Точност на оценката',
        currency: 'Валута',
        evaluationType: 'Тип оценка',
        status: {
          pending: 'В процес',
          completed: 'Завършена',
          failed: 'Неуспешна',
        },
      },
      common: {
        save: 'Запази',
        cancel: 'Отказ',
        edit: 'Редактирай',
        delete: 'Изтрий',
        loading: 'Зареждане...',
        error: 'Възникна грешка',
        success: 'Успешно запазено',
      },
    },
  },
  en: {
    translation: {
      property: {
        type: 'Property Type',
        address: 'Address',
        squareMeters: 'Square Meters',
        yearBuilt: 'Year Built',
        rooms: 'Rooms',
        floor: 'Floor',
        totalFloors: 'Total Floors',
        heating: 'Heating',
        parking: 'Parking',
      },
      evaluation: {
        estimatedValue: 'Estimated Value',
        confidence: 'Confidence Score',
        currency: 'Currency',
        evaluationType: 'Evaluation Type',
        status: {
          pending: 'Pending',
          completed: 'Completed',
          failed: 'Failed',
        },
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Successfully saved',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bg',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
