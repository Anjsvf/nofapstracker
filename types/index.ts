
export interface ReplyToMessage {
  _id: string;
  username: string;
  text: string;
  type: 'text' | 'voice';
  timestamp: Date;
}

export interface Message {
  _id: string;
  tempId?: string;
  username: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'voice';
  isOwn?: boolean;
  audioUri?: string;
  audioDuration?: number;
  replyTo?: string | ReplyToMessage | null;
  reactions?: { [emoji: string]: string[] };
  isPending?: boolean;
  isSynced?: boolean;
}


export interface User {
  username: string;
  online: boolean;
  badge?: {
    key: string;
    name: string;
    days: number;
    category: string;
  } | null;
  currentStreak?: number;
}

export interface SyncQueueItem {
  id: number;
  messageId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'REACTION';
  data: string;
  createdAt: string;
  attempts: number;
  maxAttempts: number;
}

export interface ProfileData {
  totalResets: number;
  joinDate: string;
}

export interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  currentStreak: number;
  lastResetDate: string | null;
  totalDaysCompleted: number;
}

export interface ResetHistoryEntry {
  id: string;
  date: string;
  daysCompleted?: number;
  badgeName?: string | null;
  badgeEmoji?: string | null;
  badgeCategory?: string | null;
}

export interface Badge {
  key: string;
  name: string;
  days: number;
  category: string;
  imageSource: any;
}

export interface BadgeProgress {
  current: Badge | null;
  next: Badge | null;
  progress: number;
}