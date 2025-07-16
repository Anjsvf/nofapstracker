export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  currentStreak: number;
  lastResetDate: string | null;
  totalDaysCompleted: number;
}

export interface Badge {
  key: string;
  name: string;
  days: number;
  category: string;
  imageSource: any;
}

export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'voice';
  isOwn: boolean;
}

export interface User {
  username: string;
  online: boolean;
}

export interface ProfileData {
  totalResets: number;
  joinDate: string;
}

export interface BadgeProgress {
  current: Badge | null;
  next: Badge | null;
  progress: number;
}