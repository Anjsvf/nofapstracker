import { BadgeService } from '@/services/badgeService';
import { NotificationService } from '@/services/notificationService';
import { StorageService } from '@/services/storageService';
import { Badge, TimerState } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

const INITIAL_TIMER_STATE: TimerState = {
  isRunning: false,
  startTime: null,
  currentStreak: 0,
  lastResetDate: null,
  totalDaysCompleted: 0,
};

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState>(INITIAL_TIMER_STATE);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showManualSetup, setShowManualSetup] = useState(false);


  useEffect(() => {
    loadTimerState();
    if (Platform.OS !== 'web') {
      NotificationService.requestPermissions().catch(console.error);
    }
  }, []);

  
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    if (timerState !== INITIAL_TIMER_STATE) {
      StorageService.saveTimerState(timerState).catch(console.error);
    }
  }, [timerState]);

  
  useEffect(() => {
    if (timerState.isRunning && timerState.startTime) {
      checkForCompletedDays();
    }
  }, [currentTime, timerState.isRunning, timerState.startTime]);

  const loadTimerState = useCallback(async () => {
    try {
      const saved = await StorageService.loadTimerState();
      if (saved) {
        setTimerState(saved);
      } else {
        setShowManualSetup(true);
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  }, []);

  const checkForCompletedDays = useCallback(() => {
    if (!timerState.startTime || !timerState.isRunning) return;

    const elapsed = currentTime - timerState.startTime;
    const daysDuration = 24 * 60 * 60 * 1000;
    const completedDays = Math.floor(elapsed / daysDuration);

    if (completedDays > timerState.totalDaysCompleted) {
      const newDaysCompleted = completedDays - timerState.totalDaysCompleted;
      const newStreak = timerState.currentStreak + newDaysCompleted;
      
      setTimerState(prev => ({
        ...prev,
        currentStreak: newStreak,
        totalDaysCompleted: completedDays,
      }));

      const currentBadge = BadgeService.getBadgeInfo(timerState.currentStreak);
      const newBadge = BadgeService.getBadgeInfo(newStreak);
      
      if (newBadge && (!currentBadge || newBadge.key !== currentBadge.key)) {
        NotificationService.showBadgeNotification(newBadge).catch(console.error);
        showBadgeAlert(newBadge);
      }
      NotificationService.showDayCompletionNotification(newStreak).catch(console.error);
    }
  }, [currentTime, timerState]);

  const showBadgeAlert = useCallback((badge: Badge) => {
    Alert.alert(
      '🏆 Nova Conquista!',
      `Parabéns! Você desbloqueou a conquista "${badge.name}" da categoria ${badge.category}!`,
      [{ text: 'Incrível!', style: 'default' }]
    );
  }, []);

  const startTimer = useCallback(() => {
    const now = Date.now();
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      startTime: now,
      totalDaysCompleted: 0,
    }));
  }, []);

  const setupTimer = useCallback((days: number, startTime: number) => {
    const now = Date.now();
    const elapsed = now - startTime;
    const daysDuration = 24 * 60 * 60 * 1000;
    const totalDaysCompleted = Math.floor(elapsed / daysDuration);
    
    setTimerState({
      isRunning: true,
      startTime: startTime,
      currentStreak: Math.max(days, totalDaysCompleted),
      lastResetDate: null,
      totalDaysCompleted: totalDaysCompleted,
    });

    const achievedBadge = BadgeService.getBadgeInfo(days);
    if (achievedBadge && days > 0) {
      setTimeout(() => {
        Alert.alert(
          '🎉 Progresso Importado!',
          `Bem-vindo! Você desbloqueou a conquista "${achievedBadge.name}" e todas as anteriores!`,
          [{ text: 'Fantástico!', style: 'default' }]
        );
      }, 500);
    }
    setShowManualSetup(false);
  }, []);

  const showSetupModal = useCallback(() => {
    setShowManualSetup(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowManualSetup(false);
  }, []);

 
  const resetTimer = useCallback(() => {
    Alert.alert(
      'Resetar Progresso',
      'Tem certeza que deseja resetar todo o seu progresso? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
           
              await StorageService.incrementTotalResets(timerState.currentStreak);
    
              setTimerState(prev => ({
                ...prev,
                isRunning: false,
                startTime: null,
                currentStreak: 0,
                lastResetDate: new Date().toISOString(),
                totalDaysCompleted: 0,
              }));
              
              
              Alert.alert("Sucesso", "Seu progresso foi resetado e registrado no histórico.");

            } catch (error) {
              console.error("Failed to reset timer and update count:", error);
              Alert.alert("Erro", "Ocorreu um erro ao tentar resetar seu progresso.");
            }
          },
        },
      ]
    );
  }, [timerState.currentStreak]);

  const getCurrentDayElapsed = useCallback(() => {
    if (!timerState.startTime || !timerState.isRunning) return 0;
    const elapsed = currentTime - timerState.startTime;
    const daysDuration = 24 * 60 * 60 * 1000;
    return elapsed % daysDuration;
  }, [currentTime, timerState.startTime, timerState.isRunning]);

  const getTotalElapsed = useCallback(() => {
    if (!timerState.startTime || !timerState.isRunning) return 0;
    return currentTime - timerState.startTime;
  }, [currentTime, timerState.startTime, timerState.isRunning]);

  const getCurrentDayProgress = useCallback(() => {
    if (!timerState.isRunning || !timerState.startTime) return 0;
    return Math.min(getCurrentDayElapsed() / (24 * 60 * 60 * 1000), 1);
  }, [timerState.isRunning, timerState.startTime, getCurrentDayElapsed]);

  return {
    timerState,
    currentTime,
    showManualSetup,
    startTimer,
    setupTimer,
    showSetupModal,
    handleCloseModal, 
    resetTimer,
    getCurrentDayElapsed,
    getTotalElapsed,
    getCurrentDayProgress,
  };
}