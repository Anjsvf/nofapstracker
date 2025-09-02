
import { useCallback, useEffect, useRef, useState } from 'react';

interface UsernameValidationState {
  isChecking: boolean;
  isAvailable: boolean | null;
  message: string;
  isValid: boolean;
}

interface UseUsernameValidationReturn extends UsernameValidationState {
  checkUsername: (username: string) => void;
  resetValidation: () => void;
}

export const useUsernameValidation = (): UseUsernameValidationReturn => {
  const [state, setState] = useState<UsernameValidationState>({
    isChecking: false,
    isAvailable: null,
    message: '',
    isValid: false,
  });

  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkUsername = useCallback(async (username: string) => {
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    
    if (!username.trim()) {
      setState({
        isChecking: false,
        isAvailable: null,
        message: '',
        isValid: false,
      });
      return;
    }

    
    if (username.length < 3) {
      setState({
        isChecking: false,
        isAvailable: false,
        message: 'O nome de usuário deve ter pelo menos 3 caracteres',
        isValid: false,
      });
      return;
    }

    if (username.length > 20) {
      setState({
        isChecking: false,
        isAvailable: false,
        message: 'O nome de usuário deve ter no máximo 20 caracteres',
        isValid: false,
      });
      return;
    }

    if (!/^[a-zA-Z0-9\u00C0-\u017F_]+$/.test(username)) {
      setState({
        isChecking: false,
        isAvailable: false,
        message: 'O nome de usuário pode conter apenas letras, números e _',
        isValid: false,
      });
      return;
    }

    
    setState(prev => ({
      ...prev,
      isChecking: true,
      message: 'Verificando disponibilidade...',
    }));

    
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL_PROD}/api/auth/check-username?username=${encodeURIComponent(username)}`
        );
        
        const data = await response.json();

        if (response.ok) {
          setState({
            isChecking: false,
            isAvailable: data.available,
            message: data.message,
            isValid: data.available,
          });
        } else {
          setState({
            isChecking: false,
            isAvailable: false,
            message: data.message || 'Error checking username',
            isValid: false,
          });
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setState({
          isChecking: false,
          isAvailable: null,
          message: 'Erro ao verificar o nome de usuário. Por favor, tente novamente.',
          isValid: false,
        });
      }
    }, 500);

    debounceTimerRef.current = timer;
  }, []); 

  const resetValidation = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setState({
      isChecking: false,
      isAvailable: null,
      message: '',
      isValid: false,
    });
  }, []);

  
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    ...state,
    checkUsername,
    resetValidation,
  };
};