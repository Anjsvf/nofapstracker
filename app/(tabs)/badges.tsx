import { BadgeCard } from '@/components/badges/BadgeCard';
import { BadgeModal } from '@/components/badges/BadgeModal';
import { BADGE_CATEGORIES } from '@/constants/badges';
import { BadgeService } from '@/services/badgeService';
import { StorageService } from '@/services/storageService';
import { Badge } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCurrentStreak();
  }, []);

  const loadCurrentStreak = useCallback(async () => {
    try {
      setRefreshing(true);
      const timerState = await StorageService.loadTimerState();
      if (timerState) {
        setCurrentStreak(timerState.currentStreak || 0);
      }
    } catch (error) {
      console.error('Error loading current streak:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const allBadges = BadgeService.getAllBadges();
  const currentBadge = BadgeService.getBadgeInfo(currentStreak);
  const unlockedBadges = allBadges.filter((b) => currentStreak >= b.days);

  const openBadgeModal = useCallback((badge: Badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  }, []);

  const closeBadgeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedBadge(null);
  }, []);

  const renderBadge = useCallback(
    (badge: Badge) => {
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
    },
    [currentStreak, currentBadge, openBadgeModal]
  );

  const getBadgesByCategory = useCallback((category: string) => {
    return BadgeService.getBadgesByCategory(category);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
     
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Conquistas</Text>
        <Text style={styles.subtitle}>
          {unlockedBadges.length} de {allBadges.length} desbloqueadas
        </Text>
      </View>

     
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{currentStreak}</Text>
            <Text style={styles.statLabel}>Dias</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{unlockedBadges.length}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </View>

      
      <View style={styles.currentBadgeContainer}>
        <Text style={styles.currentBadgeLabel}>Conquista Atual</Text>
        {currentBadge ? (
          <TouchableOpacity
            style={styles.currentBadgeCard}
            onPress={() => openBadgeModal(currentBadge)}
            activeOpacity={0.8}
          >
            <View style={styles.currentBadgeGradient}>
              <Image
                source={currentBadge.imageSource}
                style={styles.currentBadgeImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.currentBadgeInfo}>
              <Text style={styles.currentBadgeName}>{currentBadge.name}</Text>
              <Text style={styles.currentBadgeDesc}>
                {currentBadge.days === 0 ? 'Badge inicial' : `${currentBadge.days} dias de foco`}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noBadgeCard}>
            <Text style={styles.noBadgeText}> Comece sua jornada!</Text>
            <Text style={styles.noBadgeSubtext}>
              Complete sua primeira sessão para desbloquear badges
            </Text>
          </View>
        )}
      </View>

     
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent, 
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadCurrentStreak}
            tintColor="#3b82f6"
            colors={['#07101eff', '#1e40af']}
          />
        }
      >
        {BADGE_CATEGORIES.map((category) => {
          const categoryBadges = getBadgesByCategory(category);
          if (categoryBadges.length === 0) return null;

          const categoryUnlocked = categoryBadges.filter(b => currentStreak >= b.days).length;

          return (
            <View key={category} style={styles.categoryContainer}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <Text style={styles.categoryProgress}>
                  {categoryUnlocked}/{categoryBadges.length}
                </Text>
              </View>
              
              <View style={styles.badgesGrid}>
                {categoryBadges.map(renderBadge)}
              </View>
            </View>
          );
        })}

       
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Continue praticando para desbloquear mais badges! 💪
          </Text>
        </View>
      </ScrollView>

      <BadgeModal
        badge={selectedBadge}
        visible={modalVisible}
        currentStreak={currentStreak}
        currentBadge={currentBadge}
        onClose={closeBadgeModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
 
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
    opacity: 0.9,
  },

  // Stats
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
  },

  // Current Badge
  currentBadgeContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  currentBadgeLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  currentBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  currentBadgeGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#000',
  },
  currentBadgeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  currentBadgeInfo: {
    flex: 1,
  },
  currentBadgeName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 2,
  },
  currentBadgeDesc: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  noBadgeCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)',
  },
  noBadgeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 4,
  },
  noBadgeSubtext: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },

  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  
  // Categories
  categoryContainer: {
    marginBottom: 28,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  categoryProgress: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  // Grid
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});