import { BADGES } from '@/constants/badges';
import { Badge } from '@/types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


const MOTIVATIONAL_TITLES = [
  'Dia de Vitória! ',
  'Mantenha o Ritmo, Guerreiro!',
  'Streak em Chamas! ',
  'Não Pare Agora!',
  'Você é Imparável ',
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
 
  private static readonly DAILY_CHECK_ID = 'daily-progress-check';

  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  
  static async showBadgeNotification(badge: Badge): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Nova Conquista Desbloqueada!',
          body: `Parabéns! Você conquistou: ${badge.name}`,
          data: { badge, type: 'badge_unlocked' },
          sound: true,
        },
        trigger: null, 
      });
    } catch (error) {
      console.error('Error showing badge notification:', error);
    }
  }

  
  static async showDayCompletionNotification(streak: number): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Dia Completo!', 
          body: `Mais um dia conquistado! Sequência atual: ${streak} dias`,
          data: { streak, type: 'day_completed' },
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error showing day completion notification:', error);
    }
  }

  
  static async scheduleDailyProgressCheck(
    startTime: number,
    currentStreak: number,
    maxFutureDays: number = 30
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

     
      await this.cancelAllDailyChecks();

      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const elapsed = now - startTime;
      const currentDayProgress = elapsed % dayInMs;
      const timeUntilNextDay = dayInMs - currentDayProgress;

     
      for (let i = 1; i <= maxFutureDays; i++) {
        const secondsUntilDay = Math.floor((timeUntilNextDay + (i - 1) * dayInMs) / 1000);
        if (secondsUntilDay > 0) { 
          const futureStreak = currentStreak + i;
          const identifier = `daily-check-${futureStreak}`;

          await Notifications.scheduleNotificationAsync({
            identifier,
            content: {
              title: 'Dia Completo!',
              body: `Parabéns! Você completou ${futureStreak} dias consecutivos!`,
              data: { type: 'daily_check', streak: futureStreak },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsUntilDay,
              repeats: false,
            },
          });
        }
      }

      console.log(`Agendadas ${maxFutureDays} notificações diárias futuras.`);
    } catch (error) {
      console.error('Error scheduling daily progress check:', error);
    }
  }

  
  static async scheduleMotivationalNotifications(
    startTime: number,
    currentStreak: number
  ): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return;
      }

      
      await this.cancelAllMotivationalChecks();

      const now = Date.now();
      const elapsed = now - startTime;
      const dayInMs = 24 * 60 * 60 * 1000;
      const currentDayProgress = elapsed % dayInMs;

      
      for (let i = 0; i < 30; i++) {
        const halfDayMark = (dayInMs / 2) - currentDayProgress + (i * dayInMs);
        const secondsUntilHalf = Math.floor(halfDayMark / 1000);
        if (secondsUntilHalf > 0) {
          const futureStreak = currentStreak + i + 1;
         
          const randomTitle = MOTIVATIONAL_TITLES[Math.floor(Math.random() * MOTIVATIONAL_TITLES.length)];
          await Notifications.scheduleNotificationAsync({
            identifier: `motivational-${futureStreak}`,
            content: {
              title: randomTitle,
              body: `...`, 
              data: { type: 'motivational' },
              sound: false, 
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsUntilHalf,
              repeats: false,
            },
          });
        }
      }

      console.log(`Agendadas 30 notificações motivacionais futuras.`);
    } catch (error) {
      console.error('Error scheduling motivational notifications:', error);
    }
  }

  
  static async scheduleBadgeNotifications(
    startTime: number,
    currentStreak: number
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

  
      await this.cancelAllBadgeChecks();

      const futureBadges = BADGES.filter(badge => badge.days > currentStreak);
      
      for (const badge of futureBadges) {
        const daysUntilBadge = badge.days - currentStreak;
        const secondsUntilBadge = Math.floor(daysUntilBadge * 24 * 60 * 60);
        
        if (secondsUntilBadge > 0) {
          const identifier = `badge-${badge.key}`;
          await Notifications.scheduleNotificationAsync({
            identifier,
            content: {
              title: '🏆 Nova Conquista!',
              body: `Você desbloqueou: ${badge.name}!`,
              data: { type: 'badge_unlocked', badge: badge.key },
              sound: true,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: secondsUntilBadge,
              repeats: false,
            },
          });
        }
      }

      console.log(`Agendadas notificações para ${futureBadges.length} badges futuros.`);
    } catch (error) {
      console.error('Error scheduling badge notifications:', error);
    }
  }

 
  static async cancelAllDailyChecks(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const scheduled = await this.getScheduledNotifications();
      const dailyIds = scheduled
        .filter(n => n.identifier?.startsWith('daily-check-') || n.identifier === this.DAILY_CHECK_ID)
        .map(n => n.identifier!);
      if (dailyIds.length > 0) {
       
        for (const id of dailyIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
    } catch (error) {
      console.error('Error canceling daily checks:', error);
    }
  }

  
  static async cancelAllBadgeChecks(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const scheduled = await this.getScheduledNotifications();
      const badgeIds = scheduled
        .filter(n => n.identifier?.startsWith('badge-'))
        .map(n => n.identifier!);
      if (badgeIds.length > 0) {
      
        for (const id of badgeIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
    } catch (error) {
      console.error('Error canceling badge checks:', error);
    }
  }

  
  static async cancelAllMotivationalChecks(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      const scheduled = await this.getScheduledNotifications();
      const motivationalIds = scheduled
        .filter(n => n.identifier?.startsWith('motivational-'))
        .map(n => n.identifier!);
      if (motivationalIds.length > 0) {
        for (const id of motivationalIds) {
          await Notifications.cancelScheduledNotificationAsync(id);
        }
      }
    } catch (error) {
      console.error('Error canceling motivational checks:', error);
    }
  }

  
  static async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

 
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}