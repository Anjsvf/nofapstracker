import { Badge } from '@/types';
import { Award, Crown, Lock, Star } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface BadgeCardProps {
  badge: Badge;
  isUnlocked: boolean;
  isCurrent: boolean;
  currentStreak: number;
  onPress: () => void;
  index?: number;
  isLastInRow?: boolean;
}

export function BadgeCard({ 
  badge, 
  isUnlocked, 
  isCurrent, 
  currentStreak, 
  onPress,
  index = 0,
  isLastInRow = false
}: BadgeCardProps) {
  const getProgressPercentage = () => {
    if (badge.days === 0) return 100;
    return Math.min((currentStreak / badge.days) * 100, 100);
  };

  const getConnectionLineColor = () => {
    if (isUnlocked) return 'rgba(45, 46, 53, 0.86)';
    if (getProgressPercentage() > 50) return 'rgba(255, 193, 7, 0.5)';
    return 'rgba(127, 140, 141, 0.1)';
  };

  const getBadgeGlow = () => {
    if (isCurrent) return 'rgba(255, 217, 0, 0.07)';
    if (isUnlocked) return 'rgba(0, 0, 0, 0.84)';
    return 'transparent';
  };

  return (
    <View style={styles.badgeContainer}>
      
      {!isLastInRow && (
        <View style={[styles.connectionLineHorizontal, { backgroundColor: getConnectionLineColor() }]} />
      )}
      
     
      {index % 4 < 2 && (
        <View style={[styles.connectionLineVertical, { backgroundColor: getConnectionLineColor() }]} />
      )}

      <TouchableOpacity
        style={styles.badgeWrapper}
        onPress={onPress}
        activeOpacity={0.8}
      >
      
        {(isCurrent || isUnlocked) && (
          <View style={[styles.glowEffect, { shadowColor: getBadgeGlow() }]} />
        )}

        
        <View style={[
          styles.badgeContent,
          isCurrent && styles.badgeContentCurrent,
          !isUnlocked && styles.badgeContentLocked
        ]}>
          {/* Badge Image com overlays */}
          <View style={styles.badgeImageContainer}>
            <Image 
              source={badge.imageSource}
              style={[
                styles.badgeImage,
                !isUnlocked && styles.badgeImageLocked,
                isCurrent && styles.badgeImageCurrent
              ]}
              resizeMode="cover"
            />

            
            {!isUnlocked && (
              <View style={styles.lockOverlay}>
                <Lock size={20} color="#ffffff" />
              </View>
            )}

           
            {isCurrent && (
              <View style={styles.crownIndicator}>
                <Crown size={14} color="#000" />
              </View>
            )}

          
            {isUnlocked && !isCurrent && (
              <View style={styles.awardIndicator}>
                <Award size={12} color="#fff" />
              </View>
            )}
          </View>

         
          <View style={styles.badgeDetails}>
           
            <Text style={[
              styles.badgeDays,
              isUnlocked && styles.badgeDaysUnlocked,
              isCurrent && styles.badgeDaysCurrent
            ]}>
              {badge.days === 0 ? 'INÍCIO' : `${badge.days} DIAS`}
            </Text>
          </View>

          
          {!isUnlocked && (
            <View style={styles.progressRing}>
              <View style={styles.progressRingBg} />
              <View style={[
                styles.progressRingFill,
                {
                  transform: [{ rotate: `${(getProgressPercentage() / 100) * 360}deg` }]
                }
              ]} />
              <View style={styles.progressCenter}>
                <Text style={styles.progressText}>
                  {Math.round(getProgressPercentage())}%
                </Text>
              </View>
            </View>
          )}

         
          {isCurrent && (
            <View style={styles.currentBadge}>
              <Star size={8} color="#000" />
              <Text style={styles.currentBadgeText}>ATUAL</Text>
            </View>
          )}

          {isUnlocked && !isCurrent && (
            <View style={styles.unlockedBadge}>
              <Text style={styles.unlockedBadgeText}>✓</Text>
            </View>
          )}
        </View>

       
        <Text style={[
          styles.badgeTitle,
          isUnlocked && styles.badgeTitleUnlocked,
          isCurrent && styles.badgeTitleCurrent
        ]} numberOfLines={2}>
          {badge.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'relative',
    width: (width - 50) / 2,
    marginBottom: 60,
    alignItems: 'center',
  },

 
  connectionLineHorizontal: {
    position: 'absolute',
    right: -20,
    top: '50%',
    width: 40,
    height: 2,
    zIndex: 0,
  },
  connectionLineVertical: {
    position: 'absolute',
    bottom: -20,
    left: '50%',
    width: 2,
    height: 40,
    zIndex: 0,
  },

 
  badgeWrapper: {
    position: 'relative',
    zIndex: 1,
  },

 
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },

  
  badgeContent: {
    width: 120,
    height: 120,
    borderRadius: 60,
   
    borderWidth: 2,
    
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  badgeContentCurrent: {
   
    borderWidth: 3,
   
  },
  badgeContentLocked: {
    opacity: 0.6,
  },

  
  badgeImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  badgeImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeImageCurrent: {
   
    borderWidth: 2.5,
  },
  badgeImageLocked: {
    opacity: 0.4,
  },

  // Overlays
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 30,
   
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00000016',
  },
  awardIndicator: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Informações do badge
  badgeInfo: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    left: 10,
    right: 10,
  },
  badgeTitle: {
    fontSize: 11,
    fontFamily: 'Inter-SemiBold',
    color: 'rgba(236, 240, 241, 0.8)',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 13,
  },
  badgeTitleUnlocked: {
    color: '#FFFFFF',
  },
  badgeTitleCurrent: {
    color: '#FFC107',
    fontWeight: '700',
  },
  badgeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  badgeDays: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: 'rgba(189, 195, 199, 0.6)',
  },
  badgeDaysUnlocked: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  badgeDaysCurrent: {
    color: '#fff',
    fontWeight: '600',
  },

  // Progresso circular
  progressRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 62,
  },
  progressRingBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 62,
    borderWidth: 3,
    
  },
  progressRingFill: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    borderRadius: 62,
    borderWidth: 3,
   
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transformOrigin: '100% 50%',
  },
  progressCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -10 }, { translateY: -6 }],
  },
  progressText: {
    fontSize: 12,
    marginTop: 5,
    fontFamily: 'Inter-Bold',
    color: 'rgba(234, 231, 241, 0.8)',
  },

  // Status badges
  currentBadge: {
    position: 'absolute',
    top: -15,
    left: '50%',
    transform: [{ translateX: -25 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
    borderWidth: 1,
    borderColor: '#000',
  },
  currentBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter-Bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -12,
    right: -12,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});