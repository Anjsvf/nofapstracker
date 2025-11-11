import { MOODS } from '../constants/moods';
import { moodDatabase } from '../data/MoodDatabase';
import { MoodEntry, MoodFilter, MoodStats, MoodType } from '../types/moods';

class MoodRepository {
  async initialize(): Promise<void> {
    await moodDatabase.init();
  }

  async addMoodEntry(
    mood: MoodType,
    notes: string,
    triggers: string[]
  ): Promise<number> {
    return await moodDatabase.addEntry(mood, notes, triggers);
  }

  async getMoodEntries(filter?: MoodFilter): Promise<MoodEntry[]> {
    if (filter?.moods && filter.moods.length > 0) {
      return await moodDatabase.getEntriesByMood(filter.moods);
    }
    
    return await moodDatabase.getEntries(filter?.startDate, filter?.endDate);
  }

  async deleteMoodEntry(id: number): Promise<void> {
    await moodDatabase.deleteEntry(id);
  }

  async getMoodStats(startDate?: string, endDate?: string): Promise<MoodStats> {
    const entries = await moodDatabase.getEntries(startDate, endDate);
    const totalEntries = entries.length;

    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        moodDistribution: {
          excellent: 0,
          good: 0,
          neutral: 0,
          bad: 0,
          terrible: 0,
          sad: 0,
        },
        moodPercentages: {
          excellent: 0,
          good: 0,
          neutral: 0,
          bad: 0,
          terrible: 0,
          sad: 0,
        },
        commonTriggers: [],
        averageMoodScore: 0,
      };
    }

    // Calculate mood distribution
    const moodDistribution: Record<MoodType, number> = {
      excellent: 0,
      good: 0,
      neutral: 0,
      bad: 0,
      terrible: 0,
      sad: 0,
    };

    let totalScore = 0;

    entries.forEach(entry => {
      moodDistribution[entry.mood]++;
      const moodData = MOODS.find(m => m.type === entry.mood);
      if (moodData) {
        totalScore += moodData.score;
      }
    });

    // Calculate percentages
    const moodPercentages: Record<MoodType, number> = {
      excellent: Math.round((moodDistribution.excellent / totalEntries) * 100),
      good: Math.round((moodDistribution.good / totalEntries) * 100),
      neutral: Math.round((moodDistribution.neutral / totalEntries) * 100),
      bad: Math.round((moodDistribution.bad / totalEntries) * 100),
      terrible: Math.round((moodDistribution.terrible / totalEntries) * 100),
      sad: Math.round((moodDistribution.sad / totalEntries) * 100),
    };

    // Calculate trigger frequency
    const triggerFrequency = await moodDatabase.getTriggerFrequency();
    const commonTriggers = Object.entries(triggerFrequency)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const averageMoodScore = totalScore / totalEntries;

    return {
      totalEntries,
      moodDistribution,
      moodPercentages,
      commonTriggers,
      averageMoodScore,
    };
  }

  async getWeekdayPattern(): Promise<Record<string, Record<MoodType, number>>> {
    const entries = await moodDatabase.getEntries();
    const weekdayPattern: Record<string, Record<MoodType, number>> = {};

    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    entries.forEach(entry => {
      const date = new Date(entry.date + 'T00:00:00'); // Garante interpretação correta
      const weekday = weekdays[date.getDay()];

      if (!weekdayPattern[weekday]) {
        weekdayPattern[weekday] = {
          excellent: 0,
          good: 0,
          neutral: 0,
          bad: 0,
          terrible: 0,
          sad: 0,
        };
      }

      weekdayPattern[weekday][entry.mood]++;
    });

    return weekdayPattern;
  }
}

export const moodRepository = new MoodRepository();