import { BadgeService } from '@/services/badgeService';
import { NotificationService } from '@/services/notificationService';
import { StorageService } from '@/services/storageService';
import { TimerState } from '@/types';
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

  // Load timer state on mount
  useEffect(() => {
    loadTimerState();
    
    // Request notification permissions on app start (mobile only)
    if (Platform.OS !== 'web') {
      NotificationService.requestPermissions().catch(console.error);
    }
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save timer state whenever it changes
  useEffect(() => {
    if (timerState !== INITIAL_TIMER_STATE) {
      StorageService.saveTimerState(timerState).catch(console.error);
    }
  }, [timerState]);

  // Check for completed days and update streak
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
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  }, []);

  const checkForCompletedDays = useCallback(() => {
    if (!timerState.startTime || !timerState.isRunning) return;

    const elapsed = currentTime - timerState.startTime;
    const daysDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const completedDays = Math.floor(elapsed / daysDuration);

    if (completedDays > timerState.totalDaysCompleted) {
      // New day(s) completed
      const newDaysCompleted = completedDays - timerState.totalDaysCompleted;
      const newStreak = timerState.currentStreak + newDaysCompleted;
      
      setTimerState(prev => ({
        ...prev,
        currentStreak: newStreak,
        totalDaysCompleted: completedDays,
      }));

      // Check for new badge achievement
      const currentBadge = BadgeService.getBadgeInfo(timerState.currentStreak);
      const newBadge = BadgeService.getBadgeInfo(newStreak);
      
      if (newBadge && (!currentBadge || newBadge.key !== currentBadge.key)) {
        NotificationService.showBadgeNotification(newBadge).catch(console.error);
        showBadgeAlert(newBadge);
      }

      // Show day completion notification
      NotificationService.showDayCompletionNotification(newStreak).catch(console.error);
    }
  }, [currentTime, timerState]);

  const showBadgeAlert = useCallback((badge: any) => {
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

  const resetTimer = useCallback(() => {
    Alert.alert(
      'Resetar Progresso',
      'Tem certeza que deseja resetar todo o seu progresso? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: () => {
            setTimerState(prev => ({
              ...prev,
              isRunning: false,
              startTime: null,
              currentStreak: 0,
              lastResetDate: new Date().toISOString(),
              totalDaysCompleted: 0,
            }));
          },
        },
      ]
    );
  }, []);

  const getCurrentDayElapsed = useCallback(() => {
    if (!timerState.startTime || !timerState.isRunning) return 0;
    
    const elapsed = currentTime - timerState.startTime;
    const daysDuration = 24 * 60 * 60 * 1000;
    const currentDayElapsed = elapsed % daysDuration;
    
    return currentDayElapsed;
  }, [currentTime, timerState.startTime, timerState.isRunning]);

  const getTotalElapsed = useCallback(() => {
    if (!timerState.startTime || !timerState.isRunning) return 0;
    return currentTime - timerState.startTime;
  }, [currentTime, timerState.startTime, timerState.isRunning]);

  const getCurrentDayProgress = useCallback(() => {
    if (!timerState.isRunning || !timerState.startTime) return 0;
    const currentDayElapsed = getCurrentDayElapsed();
    return Math.min(currentDayElapsed / (24 * 60 * 60 * 1000), 1);
  }, [timerState.isRunning, timerState.startTime, getCurrentDayElapsed]);

  return {
    timerState,
    currentTime,
    startTimer,
    resetTimer,
    getCurrentDayElapsed,
    getTotalElapsed,
    getCurrentDayProgress,
  };
}