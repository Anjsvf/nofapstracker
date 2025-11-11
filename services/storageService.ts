import { ProfileData, ResetHistoryEntry, TimerState } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BadgeService } from './badgeService';

export class StorageService {
  private static readonly TIMER_STATE_KEY = 'timerState';
  private static readonly USERNAME_KEY = 'username';
  private static readonly PROFILE_DATA_KEY = 'profileData';
  private static readonly RESET_HISTORY_KEY = 'resetHistory';

 
  static async saveTimerState(timerState: TimerState): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TIMER_STATE_KEY, JSON.stringify(timerState));
    } catch (error) {
      console.error('Error saving timer state:', error);
      throw error;
    }
  }

  static async loadTimerState(): Promise<TimerState | null> {
    try {
      const saved = await AsyncStorage.getItem(this.TIMER_STATE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading timer state:', error);
      return null;
    }
  }

 
  static async saveUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USERNAME_KEY, username);
    } catch (error) {
      console.error('Error saving username:', error);
      throw error;
    }
  }

  static async loadUsername(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.USERNAME_KEY);
    } catch (error) {
      console.error('Error loading username:', error);
      return null;
    }
  }

 
  static async saveProfileData(profileData: ProfileData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.PROFILE_DATA_KEY, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving profile data:', error);
      throw error;
    }
  }

  static async loadProfileData(): Promise<ProfileData | null> {
    try {
      const saved = await AsyncStorage.getItem(this.PROFILE_DATA_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading profile data:', error);
      return null;
    }
  }

  
  static async saveResetHistory(history: ResetHistoryEntry[]): Promise<void> {
    try {
      console.log('Saving reset history:', history.length, 'entries');
      await AsyncStorage.setItem(this.RESET_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving reset history:', error);
      throw error;
    }
  }

  static async loadResetHistory(): Promise<ResetHistoryEntry[]> {
    try {
      console.log('Loading reset history...');
      const saved = await AsyncStorage.getItem(this.RESET_HISTORY_KEY);
      const result = saved ? JSON.parse(saved) : [];
      console.log('Loaded reset history:', result.length, 'entries');
      return result;
    } catch (error) {
      console.error('Error loading reset history:', error);
      return []; 
    }
  }

  
  static async addResetEntry(date: Date = new Date(), currentStreak: number = 0): Promise<void> {
    try {
      console.log('Adding reset entry for date:', date.toISOString(), 'with streak:', currentStreak);
      const currentHistory = await this.loadResetHistory();
      
     
      const currentBadge = BadgeService.getBadgeInfo(currentStreak);
      
      const newEntry: ResetHistoryEntry = {
        id: Date.now().toString(),
        date: date.toISOString(),
        daysCompleted: currentStreak,
        badgeName: currentBadge?.name || null,
        // badgeEmoji: currentBadge?.emoji || null,
        badgeCategory: currentBadge?.category || null,
      };
      
      const updatedHistory = [...currentHistory, newEntry];
      await this.saveResetHistory(updatedHistory);
      console.log('Reset entry added successfully with badge info:', {
        days: currentStreak,
        badge: currentBadge?.name || 'Nenhuma'
      });
    } catch (error) {
      console.error('Error adding reset entry:', error);
      throw error;
    }
  }

  
  static async incrementTotalResets(currentStreak: number = 0): Promise<void> {
    try {
      console.log('Incrementing total resets with streak:', currentStreak);
      const profileData = await this.loadProfileData();
      const newTotalResets = (profileData?.totalResets || 0) + 1;
      
      const newProfileData: ProfileData = {
        totalResets: newTotalResets,
        joinDate: profileData?.joinDate || new Date().toISOString(),
      };
      
      
      await Promise.all([
        this.saveProfileData(newProfileData),
        this.addResetEntry(new Date(), currentStreak)
      ]);
      
      console.log('Total resets incremented to:', newTotalResets);
    } catch (error) {
      console.error('Error incrementing total resets:', error);
      throw error;
    }
  }

 
  static async testResetHistory(): Promise<void> {
    try {
      console.log('=== Testing Reset History ===');
      
     
      await this.addResetEntry(new Date(), 15);
      console.log('Test entry added with 15 days streak');
      
     
      const history = await this.loadResetHistory();
      console.log('Current history:', history);
      
      console.log('=== Test Complete ===');
    } catch (error) {
      console.error('Error testing reset history:', error);
    }
  }

 
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.TIMER_STATE_KEY,
        this.USERNAME_KEY,
        this.PROFILE_DATA_KEY,
        this.RESET_HISTORY_KEY,
      ]);
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

 
  static async debugListKeys(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('All AsyncStorage keys:', keys);
      
      for (const key of keys) {
        if (key.includes('reset') || key.includes('profile') || key.includes('timer')) {
          const value = await AsyncStorage.getItem(key);
          console.log(`${key}:`, value);
        }
      }
    } catch (error) {
      console.error('Error listing keys:', error);
    }
  }
}