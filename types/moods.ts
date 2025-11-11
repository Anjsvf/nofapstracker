export type MoodType = 'excellent' | 'good' | 'neutral' | 'bad' | 'terrible' | 'sad';

export type TriggerType = string;

export interface MoodEntry {
  id: number;
  mood: MoodType;
  notes: string;
  triggers: TriggerType[];
  date: string; 
  createdAt: string;
}

export interface MoodStats {
  totalEntries: number;
  moodDistribution: Record<MoodType, number>;
  moodPercentages: Record<MoodType, number>;
  commonTriggers: Array<{ trigger: TriggerType; count: number }>;
  averageMoodScore: number;
}

export interface MoodFilter {
  startDate?: string;
  endDate?: string;
  moods?: MoodType[];
  triggers?: TriggerType[];
}