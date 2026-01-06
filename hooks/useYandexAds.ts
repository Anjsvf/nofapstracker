
import { useEffect, useState } from 'react';
import { MobileAds } from 'yandex-mobile-ads';

export const useYandexAds = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeYandexAds();
  }, []);

  const initializeYandexAds = async () => {
    try {
      console.log('🚀 Inicializando Yandex Mobile Ads...');
      
      // Inicializar o SDK
      await MobileAds.initialize();
      
      setIsInitialized(true);
      console.log('✅ Yandex Mobile Ads inicializado com sucesso');
    } catch (err) {
      const error = err as Error;
      console.error('❌ Erro ao inicializar Yandex Ads:', error);
      setError(error);
    }
  };

  return { isInitialized, error };
};