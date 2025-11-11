import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../utils/api';
import { socket } from '../utils/socket';
import { BadgeService } from './badgeService';

export class BadgeSyncService {
  // ✅ Corrigido: no React Native, setInterval retorna number
  private static syncInterval: number | null = null;
  private static currentStreak: number = 0;
  private static lastSyncedBadge: string | null = null;

  static async syncBadgeOnConnect(currentStreak: number): Promise<void> {
    this.currentStreak = currentStreak;
    const badge = BadgeService.getBadgeInfo(currentStreak);
    
    console.log('💎 Sincronizando badge ao conectar:', badge?.name || 'Nenhuma');

    if (socket.connected) {
      socket.emit('updateBadge', {
        badge: badge ? {
          key: badge.key,
          name: badge.name,
          days: badge.days,
          category: badge.category,
        } : null,
        currentStreak,
      });

      this.lastSyncedBadge = badge?.key || null;
    }
  }

  static async syncBadgeHTTP(currentStreak: number): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const badge = BadgeService.getBadgeInfo(currentStreak);
      
      await fetch(`${API_URL}/api/badges/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentBadge: badge ? {
            key: badge.key,
            name: badge.name,
            days: badge.days,
            category: badge.category,
          } : null,
          currentStreak,
        }),
      });

      console.log('💎 Badge sincronizada via HTTP');
    } catch (error) {
      console.error('❌ Erro ao sincronizar badge via HTTP:', error);
    }
  }

  static async updateBadge(newStreak: number): Promise<void> {
    if (newStreak === this.currentStreak) return;

    this.currentStreak = newStreak;
    const badge = BadgeService.getBadgeInfo(newStreak);
    const badgeKey = badge?.key || null;

    if (badgeKey !== this.lastSyncedBadge) {
      console.log('💎 Badge mudou, sincronizando...', badge?.name);

      if (socket.connected) {
        socket.emit('updateBadge', {
          badge: badge ? {
            key: badge.key,
            name: badge.name,
            days: badge.days,
            category: badge.category,
          } : null,
          currentStreak: newStreak,
        });
      }

      await this.syncBadgeHTTP(newStreak);
      this.lastSyncedBadge = badgeKey;
    }
  }

  static startPeriodicSync(getCurrentStreak: () => number): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      const streak = getCurrentStreak();
      this.updateBadge(streak);
    }, 5 * 60 * 1000);

    console.log('⏰ Sincronização periódica de badges iniciada');
  }

  static stopPeriodicSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏰ Sincronização periódica de badges parada');
    }
  }

  static async getUserBadge(username: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(`${API_URL}/api/badges/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('❌ Erro ao buscar badge do usuário:', error);
    }
    return null;
  }
}