import { Badge } from '@/types';
import { Lock, Star } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  isCurrent: boolean;
  currentStreak: number;
  onPress: () => void;
}

export function BadgeCard({ 
  badge, 
  isUnlocked, 
  isCurrent, 
  currentStreak, 
  onPress 
}: BadgeCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.badgeCard,
        isUnlocked && styles.badgeCardUnlocked,
        isCurrent && styles.badgeCardCurrent,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.badgeIconContainer}>
        {isUnlocked ? (
          <Image 
            source={badge.imageSource}
            style={[
              styles.badgeImage,
              isCurrent && styles.badgeImageCurrent
            ]}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.lockedBadgeContainer}>
            <Image 
              source={badge.imageSource}
              style={[styles.badgeImage, styles.badgeImageLocked]}
              resizeMode="cover"
            />
            <View style={styles.lockOverlay}>
              <Lock size={24} color="#ffffff" />
            </View>
          </View>
        )}
        {isCurrent && (
          <View style={styles.currentBadge}>
            <Star size={16} color="#ffd700" />
          </View>
        )}
      </View>
      
      <Text style={[
        styles.badgeTitle,
        isUnlocked && styles.badgeTitleUnlocked
      ]}>
        {badge.name}
      </Text>
      
      <Text style={[
        styles.badgeDays,
        isUnlocked && styles.badgeDaysUnlocked
      ]}>
        {badge.days === 0 ? 'Início' : `${badge.days} dias`}
      </Text>
      
      <Text style={styles.badgeCategory}>
        {badge.category}
      </Text>
      
      {!isUnlocked && (
        <Text style={styles.badgeProgress}>
          {currentStreak}/{badge.days}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badgeCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeCardUnlocked: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: '#8b5cf6',
  },
  badgeCardCurrent: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderColor: '#ffd700',
  },
  badgeIconContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  badgeImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  badgeImageCurrent: {
    borderColor: '#ffd700',
    borderWidth: 3,
  },
  badgeImageLocked: {
    opacity: 0.3,
  },
  lockedBadgeContainer: {
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffd700',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeTitleUnlocked: {
    color: '#ffffff',
  },
  badgeDays: {
    fontSize: 12,
    fontFamily: 'RobotoMono-Regular',
    color: '#64748b',
    marginBottom: 4,
  },
  badgeDaysUnlocked: {
    color: '#a78bfa',
  },
  badgeCategory: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  badgeProgress: {
    fontSize: 10,
    fontFamily: 'RobotoMono-Regular',
    color: '#64748b',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
});