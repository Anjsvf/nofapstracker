import { BadgeCard } from '@/components/badges/BadgeCard';
import { BadgeModal } from '@/components/badges/BadgeModal';
import { BADGE_CATEGORIES } from '@/constants/badges';
import { BadgeService } from '@/services/badgeService';
import { StorageService } from '@/services/storageService';
import { Badge } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BadgesScreen() {
  const insets = useSafeAreaInsets();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  useEffect(() => {
    loadCurrentStreak();
  }, []);

  const loadCurrentStreak = useCallback(async () => {
    try {
      const timerState = await StorageService.loadTimerState();
      if (timerState) {
        setCurrentStreak(timerState.currentStreak || 0);
      }
    } catch (error) {
      console.error('Error loading current streak:', error);
    }
  }, []);

  const allBadges = BadgeService.getAllBadges();
  const currentBadge = BadgeService.getBadgeInfo(currentStreak);

  const openBadgeModal = useCallback((badge: Badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  }, []);

  const closeBadgeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedBadge(null);
  }, []);

  const renderBadge = useCallback((badge: Badge) => {
    const isUnlocked = currentStreak >= badge.days;
    const isCurrent = currentBadge?.key === badge.key;
    
    return (
      <BadgeCard
        key={badge.key}
        badge={badge}
        isUnlocked={isUnlocked}
        isCurrent={isCurrent}
        currentStreak={currentStreak}
        onPress={() => openBadgeModal(badge)}
      />
    );
  }, [currentStreak, currentBadge, openBadgeModal]);

  const getBadgesByCategory = useCallback((category: string) => {
    return BadgeService.getBadgesByCategory(category);
  }, []);

  return (
    <LinearGradient colors={['#3d2050', '#2a1c3a', '#1a0f2e']} style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Conquistas</Text>
        <Text style={styles.subtitle}>
          {allBadges.filter(b => currentStreak >= b.days).length} de {allBadges.length} desbloqueadas
        </Text>
      </View>

      <View style={styles.currentBadgeContainer}>
        <Text style={styles.currentBadgeLabel}>Conquista Atual</Text>
        {currentBadge ? (
          <TouchableOpacity 
            style={styles.currentBadgeInfo}
            onPress={() => openBadgeModal(currentBadge)}
            activeOpacity={0.7}
          >
            <Image 
              source={currentBadge.imageSource}
              style={styles.currentBadgeImage}
              resizeMode="cover"
            />
            <Text style={styles.currentBadgeName}>{currentBadge.name}</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noBadgeText}>Comece sua jornada!</Text>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {BADGE_CATEGORIES.map(category => {
          const categoryBadges = getBadgesByCategory(category);
          if (categoryBadges.length === 0) return null;
          
          return (
            <View key={category} style={styles.categoryContainer}>
              <Text style={styles.categoryTitle}>{category}</Text>
              <View style={styles.badgesGrid}>
                {categoryBadges.map(renderBadge)}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <BadgeModal
        badge={selectedBadge}
        visible={modalVisible}
        currentStreak={currentStreak}
        currentBadge={currentBadge}
        onClose={closeBadgeModal}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#a78bfa',
    textAlign: 'center',
  },
  currentBadgeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  currentBadgeLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#a78bfa',
    marginBottom: 8,
  },
  currentBadgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentBadgeImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  currentBadgeName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 12,
  },
  noBadgeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748b',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryContainer: {
    marginBottom: 30,
  },
  categoryTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});