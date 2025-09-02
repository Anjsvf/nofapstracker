import { LinearGradient } from 'expo-linear-gradient';
import { Plus } from 'lucide-react-native';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface EmojiSelectorProps {
  isVisible: boolean;
  isOwnMessage?: boolean;
  onEmojiPress: (emoji: string) => void;
  onMoreEmojisPress: () => void;
  showBelow?: boolean; 
}

const { width: windowWidth } = Dimensions.get('window');

export const EmojiSelector: React.FC<EmojiSelectorProps> = ({
  isVisible,
  isOwnMessage,
  onEmojiPress,
  onMoreEmojisPress,
  showBelow = false, 
}) => {
  if (!isVisible) return null;

  const pickerEmojis = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  return (
    <View style={[
      styles.container,
      showBelow ? styles.containerBelow : styles.containerAbove,
      isOwnMessage ? styles.ownContainer : styles.otherContainer
    ]}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.81)', 'rgba(1, 19, 5, 0.88)']}
        style={styles.quickReactions}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {pickerEmojis.map((emoji, index) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.quickReactionButton,
              index === 0 && styles.firstButton,
              index === pickerEmojis.length - 1 && styles.lastEmojiButton
            ]}
            onPress={() => onEmojiPress(emoji)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickReactionEmoji}>{emoji}</Text>
          </TouchableOpacity>
        ))}
        
        
        <View style={styles.separator} />
        
        <TouchableOpacity
          style={[styles.quickReactionButton, styles.moreButton]}
          onPress={onMoreEmojisPress}
          activeOpacity={0.7}
        >
          <View style={styles.moreButtonContent}>
            <Plus size={16} color="#ffffff" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  containerAbove: {
    top: -8,
  },
  containerBelow: {
    bottom: -8,
  },
  otherContainer: {
    left: 0,
  },
  ownContainer: {
    right: 0,
  },
  quickReactions: {
    flexDirection: 'row',
    borderRadius: 28,
    paddingHorizontal: 6,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quickReactionButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 2,
  },
  firstButton: {
    marginLeft: 0,
  },
  lastEmojiButton: {
    marginRight: 4,
  },
  quickReactionEmoji: {
    fontSize: 22,
    lineHeight: 24,
    textAlign: 'center',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  moreButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 0,
  },
  moreButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});