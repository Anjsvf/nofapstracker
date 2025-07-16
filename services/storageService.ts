import { ProfileData, TimerState } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageService {
  private static readonly TIMER_STATE_KEY = 'timerState';
  private static readonly USERNAME_KEY = 'username';
  private static readonly PROFILE_DATA_KEY = 'profileData';

  // Timer State Management
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

  // Username Management
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

  // Profile Data Management
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

  // Clear All Data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.TIMER_STATE_KEY,
        this.USERNAME_KEY,
        this.PROFILE_DATA_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}