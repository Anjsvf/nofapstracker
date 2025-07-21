import { Badge } from '@/types';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications for production builds
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
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
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🏆 Nova Conquista Desbloqueada!',
          body: `Parabéns! Você conquistou: ${badge.name}`,
          data: { badge },
        },
        trigger: null, // Show immediately
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
      // Request permissions first
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Dia Completo!',
          body: `Mais um dia conquistado! Sequência atual: ${streak} dias`,
          data: { streak },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing day completion notification:', error);
    }
  }
}