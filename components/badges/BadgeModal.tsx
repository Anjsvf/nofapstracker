import { Badge } from '@/types';
import { Award, Calendar, Crown, Lock, Trophy } from 'lucide-react-native';
import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View
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
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Reset translateY para 0 ao abrir
      translateY.setValue(0);
      // Anima entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Anima saída - agora usando translateY para o gesto
      handleClose();
    }
  }, [visible]);

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Pode adicionar feedback tátil aqui se quiser
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Permite apenas deslizar para baixo
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > height * 0.2 || gestureState.vy > 0.5) {
          // Threshold: 20% da altura da tela ou velocidade para baixo
          handleClose();
        } else {
          // Volta para posição original com spring para sensação natural
          Animated.spring(translateY, {
            toValue: 0,
            tension: 300,
            friction: 30,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset slideAnim para próxima abertura
      slideAnim.setValue(height);
      translateY.setValue(0);
      onClose();
    });
  };

  if (!badge) return null;

  const isUnlocked = currentStreak >= badge.days;
  const isCurrent = currentBadge?.key === badge.key;
  const daysRemaining = badge.days - currentStreak;
  const progressPercentage = badge.days === 0 ? 100 : Math.min((currentStreak / badge.days) * 100, 100);

  const totalTranslateY = Animated.add(slideAnim, translateY);

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Animated.View 
          style={[
            styles.overlayBackground,
            { opacity: opacityAnim }
          ]} 
        />
        
        <Animated.View
          style={[
            styles.modalWrapper,
            {
              transform: [{ translateY: totalTranslateY }]
            }
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View 
              style={styles.modalContent}
              {...panResponder.panHandlers}
            >
              {/* Handle bar - indica que pode arrastar */}
              <View style={styles.handleBar} />

              {/* Header sem botão de fechar */}
              <View style={styles.modalHeader}>
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
                    <Text style={styles.currentBannerText}>CONQUISTA ATUAL</Text>
                  </View>
                )}
              </View>

              {/* Badge Image Section */}
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
                    <View style={styles.modalCurrentIndicator} />
                  )}
                  
                  {isUnlocked && !isCurrent && (
                    <View style={styles.modalUnlockedIndicator}>
                      <Award size={16} color="#fff" />
                    </View>
                  )}
                </View>
              </View>

              {/* Title Section */}
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

              {/* Status Section */}
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
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
  modalWrapper: {
    width: '100%',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
    paddingBottom: 40,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Handle bar - agora serve como indicador de arrastar
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },

  // Header - ajustado sem o botão de fechar
  modalHeader: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    // Removido space-between, agora só o conteúdo à esquerda
    alignItems: 'center',
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
    borderColor: '#0000001a',
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
  },
  statusCard: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusCardCurrent: {
    backgroundColor: '#000',
    borderColor: '#000000ff',
  },
  statusCardUnlocked: {
    backgroundColor: '#000',
    borderColor: '#0e0404ff',
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
    backgroundColor: 'rgba(0, 0, 0, 0.96)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 1)',
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
    backgroundColor: '#000',
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
});