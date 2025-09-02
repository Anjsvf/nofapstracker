import { BADGES } from '@/constants/badges';
import { Badge, BadgeProgress } from '@/types';

export class BadgeService {
  static getBadgeInfo(currentStreak: number): Badge | null {
    
    const earnedBadges = BADGES.filter(badge => currentStreak >= badge.days);
    
    if (earnedBadges.length === 0) {
      return null;
    }
    
    
    return earnedBadges.reduce((highest, current) => 
      current.days > highest.days ? current : highest
    );
  }

  static getNextBadge(currentStreak: number): Badge | null {
    const nextBadges = BADGES.filter(badge => currentStreak < badge.days);
    
    if (nextBadges.length === 0) {
      return null;
    }
    
    
    return nextBadges.reduce((lowest, current) => 
      current.days < lowest.days ? current : lowest
    );
  }

  static getAllBadges(): Badge[] {
    return [...BADGES].sort((a, b) => a.days - b.days);
  }

  static getBadgeProgress(currentStreak: number): BadgeProgress {
    const current = this.getBadgeInfo(currentStreak);
    const next = this.getNextBadge(currentStreak);
    
    let progress = 0;
    
    if (next) {
      const previousDays = current ? current.days : 0;
      const totalDays = next.days - previousDays;
      const currentProgress = currentStreak - previousDays;
      progress = Math.min(currentProgress / totalDays, 1);
    } else {
      progress = 1; 
    }
    
    return {
      current,
      next,
      progress,
    };
  }

  static getBadgesByCategory(category: string): Badge[] {
    return BADGES.filter(badge => badge.category === category);
  }
}