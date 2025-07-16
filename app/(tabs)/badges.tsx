import { BadgeCard } from '@/components/badges/BadgeCard';
import { BADGE_CATEGORIES } from '@/constants/badges';
import { BadgeService } from '@/services/badgeService';
import { StorageService } from '@/services/storageService';
import { Badge } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Star, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
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

  const renderBadgeModal = () => {
    if (!selectedBadge) return null;

    const isUnlocked = currentStreak >= selectedBadge.days;
    const isCurrent = currentBadge?.key === selectedBadge.key;
    const daysRemaining = selectedBadge.days - currentStreak;

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeBadgeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeBadgeModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity style={styles.closeButton} onPress={closeBadgeModal}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={styles.modalImageContainer}>
              <Image 
                source={selectedBadge.imageSource}
                style={[
                  styles.modalBadgeImage,
                  !isUnlocked && styles.modalBadgeImageLocked
                ]}
                resizeMode="cover"
              />
              {!isUnlocked && (
                <View style={styles.modalLockOverlay}>
                  <Lock size={32} color="#ffffff" />
                </View>
              )}
              {isCurrent && (
                <View style={styles.modalCurrentBadge}>
                  <Star size={20} color="#ffd700" />
                </View>
              )}
            </View>

            <Text style={styles.modalBadgeTitle}>{selectedBadge.name}</Text>
            <Text style={styles.modalBadgeCategory}>{selectedBadge.category}</Text>
            
            <View style={styles.modalBadgeInfo}>
              <Text style={styles.modalBadgeDays}>
                {selectedBadge.days === 0 ? 'Início da jornada' : `${selectedBadge.days} dias necessários`}
              </Text>
              
              {isUnlocked ? (
                <View style={styles.modalUnlockedContainer}>
                  <Text style={styles.modalUnlockedText}>🎉 Conquista Desbloqueada!</Text>
                  {isCurrent && (
                    <Text style={styles.modalCurrentText}>⭐ Conquista Atual</Text>
                  )}
                </View>
              ) : (
                <View style={styles.modalLockedContainer}>
                  <Text style={styles.modalLockedText}>🔒 Conquista Bloqueada</Text>
                  <Text style={styles.modalProgressText}>
                    Progresso: {currentStreak}/{selectedBadge.days} dias
                  </Text>
                  <Text style={styles.modalRemainingText}>
                    {daysRemaining === 1 
                      ? 'Falta apenas 1 dia!' 
                      : `Faltam ${daysRemaining} dias`
                    }
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.modalCloseButton} onPress={closeBadgeModal}>
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

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

      {renderBadgeModal()}
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a1c3a',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 20,
    maxWidth: 350,
    width: '100%',
    borderWidth: 1,
    borderColor: '#4c3368',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalImageContainer: {
    position: 'relative',
    marginBottom: 20,
    marginTop: 20,
  },
  modalBadgeImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#8b5cf6',
  },
  modalBadgeImageLocked: {
    opacity: 0.6,
  },
  modalLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCurrentBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffd700',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBadgeTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBadgeCategory: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#a78bfa',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBadgeInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalBadgeDays: {
    fontSize: 18,
    fontFamily: 'RobotoMono-Regular',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalUnlockedContainer: {
    alignItems: 'center',
  },
  modalUnlockedText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalCurrentText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffd700',
    textAlign: 'center',
  },
  modalLockedContainer: {
    alignItems: 'center',
  },
  modalLockedText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalProgressText: {
    fontSize: 14,
    fontFamily: 'RobotoMono-Regular',
    color: '#a78bfa',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalRemainingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748b',
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    minWidth: 120,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    textAlign: 'center',
  },
});