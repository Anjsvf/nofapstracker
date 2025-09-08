import { Badge } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Calendar, Crown, Lock, Star, Target, Trophy, Zap } from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface BadgeModalProps {
  badge: Badge | null;
  visible: boolean;
  currentStreak: number;
  currentBadge: Badge | null;
  onClose: () => void;
}

export function BadgeModal({ 
  badge, 
  visible, 
  currentStreak, 
  currentBadge, 
  onClose 
}: BadgeModalProps) {
  if (!badge) return null;

  const isUnlocked = currentStreak >= badge.days;
  const isCurrent = currentBadge?.key === badge.key;
  const daysRemaining = badge.days - currentStreak;
  const progressPercentage = badge.days === 0 ? 100 : Math.min((currentStreak / badge.days) * 100, 100);

  const getModalGradient = () => {
    if (isCurrent) {
      return ['#171a1897', '#171a1897', '#171a1897'] as const;
    }
    if (isUnlocked) {
      return ['#171a1897', '#171a1897', '#171a1897'] as const;
    }
    return ['#171a1897', '#171a1897', '#171a1897'] as const;
  };

  const getHeaderGradient = () => {
    if (isCurrent) {
      return ['#171a1897', '#171a1897', '#171a1897'] as const;
    }
    if (isUnlocked) {
      return ['#171a1897', '#171a1897', '#171a1897'] as const;
    }
    return ['#171a1897', '#171a1897', '#171a1897'] as const;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalWrapper} onPress={(e) => e.stopPropagation()}>
          <LinearGradient
            colors={getModalGradient()}
            style={styles.modalContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
           
            <LinearGradient
              colors={getHeaderGradient()}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.categoryContainer}>
                  <Trophy size={16} color={isCurrent ? "#ffffff" : "rgba(255, 255, 255, 0.8)"} />
                  <Text style={[
                    styles.modalHeaderCategory,
                    isCurrent && styles.modalHeaderCategoryCurrent
                  ]}>
                    {badge.category.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              {isCurrent && (
                <View style={styles.currentBanner}>
                  <Crown size={14} color="#000" />
                  <Text style={styles.currentBannerText}>CONQUISTA ATUAL</Text>
                  <Crown size={14} color="#000" />
                </View>
              )}
            </LinearGradient>

           
            <View style={styles.modalImageSection}>
              <View style={[
                styles.modalImageContainer,
                isCurrent && styles.modalImageContainerCurrent
              ]}>
                <Image 
                  source={badge.imageSource}
                  style={[
                    styles.modalBadgeImage,
                    !isUnlocked && styles.modalBadgeImageLocked,
                    isCurrent && styles.modalBadgeImageCurrent
                  ]}
                  resizeMode="cover"
                />
                
                {!isUnlocked && (
                  <View style={styles.modalLockOverlay}>
                    <Lock size={32} color="#ffffff" />
                  </View>
                )}
                
                {isCurrent && (
                  <View style={styles.modalCurrentIndicator}>
                    <Star size={18} color="#000" />
                  </View>
                )}
                
                {isUnlocked && !isCurrent && (
                  <View style={styles.modalUnlockedIndicator}>
                    <Award size={16} color="#fff" />
                  </View>
                )}
              </View>
            </View>

           
            <View style={styles.titleSection}>
              <Text style={[
                styles.modalBadgeTitle,
                isCurrent && styles.modalBadgeTitleCurrent
              ]}>
                {badge.name}
              </Text>
              
              <View style={styles.daysInfoContainer}>
                <Calendar size={16} color={isUnlocked ? "rgba(16, 185, 129, 0.8)" : "#ffffff"} />
                <Text style={[
                  styles.modalBadgeDays,
                  isUnlocked && styles.modalBadgeDaysUnlocked
                ]}>
                  {badge.days === 0 ? 'INÍCIO DA JORNADA' : `${badge.days} DIAS NECESSÁRIOS`}
                </Text>
              </View>
            </View>

           
            <View style={styles.statusSection}>
              {isUnlocked ? (
                <View style={[
                  styles.statusCard,
                  isCurrent ? styles.statusCardCurrent : styles.statusCardUnlocked
                ]}>
                  <View style={styles.statusContent}>
                    <View style={styles.statusIcon}>
                      {isCurrent ? <Crown size={20} color="#ffffff" /> : <Trophy size={20} color="#fff" />}
                    </View>
                    <Text style={[
                      styles.statusTitle,
                      isCurrent && styles.statusTitleCurrent
                    ]}>
                      {isCurrent ? 'CONQUISTA ATUAL' : 'CONQUISTADO'}
                    </Text>
                    <Text style={[
                      styles.statusSubtitle,
                      isCurrent && styles.statusSubtitleCurrent
                    ]}>
                      {isCurrent 
                        ? 'Você está usando este badge' 
                        : 'Parabéns pela conquista!'
                      }
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Target size={18} color="#ffffff" />
                    <Text style={styles.progressTitle}>PROGRESSO</Text>
                  </View>
                  
                  <View style={styles.progressBarSection}>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg} />
                      <View style={[
                        styles.progressBarFill, 
                        { width: `${progressPercentage}%` }
                      ]} />
                    </View>
                    
                    <View style={styles.progressStats}>
                      <Text style={styles.progressText}>
                        {currentStreak}/{badge.days} dias
                      </Text>
                      <Text style={styles.progressPercentage}>
                        {Math.round(progressPercentage)}%
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.remainingInfo}>
                    <Zap size={14} color="rgba(245, 158, 11, 0.8)" />
                    <Text style={styles.remainingText}>
                      {daysRemaining === 1 
                        ? 'FALTA APENAS 1 DIA!' 
                        : `Faltam ${daysRemaining} dias`
                      }
                    </Text>
                  </View>
                </View>
              )}
            </View>

           
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>
                FECHAR
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    backgroundColor: 'rgba(26, 27, 33, 0.95)',
  },
  
  // Header
  modalHeader: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderCategory: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
  },
  modalHeaderCategoryCurrent: {
    color: '#ffffff',
  },
  currentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'center',
  },
  currentBannerText: {
    fontSize: 11,
    fontFamily: 'Inter-Bold',
    color: '#ab0e0eff',
    letterSpacing: 0.5,
  },

  // Badge Image Section
  modalImageSection: {
    alignItems: 'center',
    paddingVertical: 28,
    position: 'relative',
  },
  modalImageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageContainerCurrent: {
    transform: [{ scale: 1.05 }],
  },
  modalBadgeImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  modalBadgeImageCurrent: {
    borderColor: 'rgba(255, 215, 0, 0.9)',
    borderWidth: 5,
  },
  modalBadgeImageLocked: {
    opacity: 0.5,
  },
  modalLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalCurrentIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255, 215, 0, 0.9)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  modalUnlockedIndicator: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Title Section
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalBadgeTitle: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 28,
  },
  modalBadgeTitleCurrent: {
    color: 'rgba(255, 215, 0, 0.9)',
  },
  daysInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalBadgeDays: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  modalBadgeDaysUnlocked: {
    color: 'rgba(16, 185, 129, 0.8)',
  },

  // Status Section
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statusCard: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusCardCurrent: {
    backgroundColor: '#1e293b4f',
    borderColor: '#ffffff',
  },
  statusCardUnlocked: {
    backgroundColor: '#1e293b53',
    borderColor: '#ffffff',
  },
  statusContent: {
    alignItems: 'center',
  },
  statusIcon: {
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  statusTitleCurrent: {
    color: '#ffffff',
  },
  statusSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  statusSubtitleCurrent: {
    color: '#ffffff',
  },

  // Progress Card
  progressCard: {
    backgroundColor: 'rgba(28, 27, 30, 0.33)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(228, 220, 242, 0.34)',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    justifyContent: 'center',
  },
  progressTitle: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  progressBarSection: {
    marginBottom: 14,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 6,
    backgroundColor: '#d5dcecff',
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#ffffff',
  },
  progressPercentage: {
    fontSize: 13,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  remainingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  remainingText: {
    fontSize: 13,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(245, 158, 11, 0.8)',
    textAlign: 'center',
  },

  // Close Button
  closeButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0f172a',
  },
  closeButtonText: {
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.3,
  },
});