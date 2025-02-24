import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function useUnsavedChanges(isDirty: boolean) {
  const [location] = useLocation();

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleLocationChange = (newLocation: string) => {
      if (isDirty && !window.confirm('Имате незапазени промени. Сигурни ли сте, че искате да напуснете страницата?')) {
        window.history.pushState(null, '', location);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', () => handleLocationChange(window.location.pathname));

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', () => handleLocationChange(window.location.pathname));
    };
  }, [isDirty, location]);
}
