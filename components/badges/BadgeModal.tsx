import { Badge } from '@/types';
import { Lock, Star, X } from 'lucide-react-native';
import React from 'react';
import {
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.modalImageContainer}>
            <Image 
              source={badge.imageSource}
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

          <Text style={styles.modalBadgeTitle}>{badge.name}</Text>
          <Text style={styles.modalBadgeCategory}>{badge.category}</Text>
          
          <View style={styles.modalBadgeInfo}>
            <Text style={styles.modalBadgeDays}>
              {badge.days === 0 ? 'Início da jornada' : `${badge.days} dias necessários`}
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
                  Progresso: {currentStreak}/{badge.days} dias
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

          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseButtonText}>Fechar</Text>
          </TouchableOpacity>
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