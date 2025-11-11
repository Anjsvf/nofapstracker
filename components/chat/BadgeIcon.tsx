
import { BADGES } from '@/constants/badges';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BadgeIconProps {
  badgeKey?: string | null;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
  onPress?: () => void;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  badgeKey,
  size = 'small',
  showTooltip = false,
  onPress,
}) => {
  if (!badgeKey) return null;

  const badge = BADGES.find(b => b.key === badgeKey);
  if (!badge) return null;

  const sizeMap = {
    small: 20,
    medium: 32,
    large: 48,
  };

  const iconSize = sizeMap[size];

  const content = (
    <View style={styles.container}>
      <Image
        source={badge.imageSource}
        style={[
          styles.badgeImage,
          { width: iconSize, height: iconSize },
        ]}
        resizeMode="contain"
      />
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{badge.name}</Text>
          <Text style={styles.tooltipSubtext}>{badge.category}</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeImage: {
    borderRadius: 4,
  },
  tooltip: {
    position: 'absolute',
    bottom: -40,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    zIndex: 1000,
  },
  tooltipText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  tooltipSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
});