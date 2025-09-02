import { EmojiSelector } from '@/components/emojiSelector/EmojiSelector';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Linking,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EmojiPickerModal } from '../../components/emoji/EmojiPickerModal';
import ReactionDetailsModal from '../../components/userReaction/ReactionDetailsModal';
import { Message } from '../../types';
import { formatTime } from '../../utils/helpers';
import { AudioMessage } from './AudioMessage';

interface MessageBubbleProps {
  message: Message;
  onPlayAudio?: (uri: string, messageId: string) => void;
  onPauseAudio?: () => void;
  onStopAudio?: () => void;
  playingId?: string | null;
  audioPosition?: number;
  audioDuration?: number;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  onScrollToMessage?: (messageId: string) => void;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (messageId: string) => void;
  onClearSelection?: () => void;
}

const { width: windowWidth } = Dimensions.get('window');
const MIN_FONT_SIZE = 8;
const MAX_VISIBLE_REACTIONS = 3;

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onPlayAudio,
  onPauseAudio,
  onStopAudio,
  playingId,
  audioPosition = 0,
  audioDuration = 0,
  onAddReaction,
  onReply,
  onScrollToMessage,
  isHighlighted = false,
  isSelected = false,
  onSelectionChange,
  onClearSelection,
}) => {
  const [highlightAnim] = useState(new Animated.Value(0));
  const [swipeX] = useState(new Animated.Value(0));
  const [showReplyIcon, setShowReplyIcon] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const [showVisibleReactionDetails, setShowVisibleReactionDetails] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<[string, string[]] | null>(null);
  const [hiddenReactions, setHiddenReactions] = useState<[string, string[]][]>([]);

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (message.reactions && Object.keys(message.reactions).length > 0) {
      const reactionEntries = Object.entries(message.reactions).sort((a, b) => b[1].length - a[1].length);
      const hiddenReactionsList = reactionEntries.slice(MAX_VISIBLE_REACTIONS);
      setHiddenReactions(hiddenReactionsList);
    } else {
      setHiddenReactions([]);
    }
  }, [message.reactions]);

  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt, gestureState) =>
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onMoveShouldSetPanResponder: (evt, gestureState) =>
          Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderGrant: () => {
          swipeX.setOffset(swipeX._value);
          swipeX.setValue(0);
          if (isSelected && onClearSelection) {
            onClearSelection();
          }
        },
        onPanResponderMove: (evt, gestureState) => {
          let newValue = gestureState.dx;
          if (message.isOwn) {
            newValue = Math.min(0, Math.max(-80, gestureState.dx));
          } else {
            newValue = Math.max(0, Math.min(80, gestureState.dx));
          }
          swipeX.setValue(newValue);
          const threshold = 30;
          if (Math.abs(newValue) > threshold && !showReplyIcon) {
            setShowReplyIcon(true);
          } else if (Math.abs(newValue) <= threshold && showReplyIcon) {
            setShowReplyIcon(false);
          }
        },
        onPanResponderRelease: (evt, gestureState) => {
          const threshold = 50;
          if (Math.abs(gestureState.dx) > threshold) {
            onReply?.(message);
            Animated.timing(swipeX, {
              toValue: message.isOwn ? -100 : 100,
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              swipeX.flattenOffset();
              swipeX.setValue(0);
              setShowReplyIcon(false);
            });
          } else {
            Animated.spring(swipeX, {
              toValue: 0,
              tension: 100,
              friction: 8,
              useNativeDriver: false,
            }).start(() => {
              swipeX.flattenOffset();
              setShowReplyIcon(false);
            });
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(swipeX, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: false,
          }).start(() => {
            swipeX.flattenOffset();
            setShowReplyIcon(false);
          });
        },
      }),
    [onReply, message, showReplyIcon, swipeX, isSelected, onClearSelection]
  );

  React.useEffect(() => {
    if (isHighlighted) {
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isHighlighted]);

  const handlePress = () => {
    if (isSelected && onClearSelection) {
      onClearSelection();
    }
  };

  const handleLongPress = () => {
    if (onSelectionChange) {
      onSelectionChange(message._id);
    }
  };

  const handlePressIn = () => {
    tapCountRef.current++;
    if (tapCountRef.current === 1) {
      tapTimerRef.current = setTimeout(() => (tapCountRef.current = 0), 300);
    } else if (tapCountRef.current === 2) {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      tapCountRef.current = 0;
      if (message.type === 'text') {
        Clipboard.setStringAsync(message.text)
          .then(() => Alert.alert('Copiado', 'Texto copiado para a área de transferência'))
          .catch(() => Alert.alert('Erro', 'Não foi possível copiar o texto'));
      }
    }
  };

  const handleReplyPress = () => {
    if (message.replyTo && onScrollToMessage) {
      onScrollToMessage(message.replyTo._id);
    }
  };

  
  const handleEmojiSelect = (emoji: string) => {
    onAddReaction?.(message._id, emoji);
    if (onClearSelection) {
      onClearSelection();
    }
  };

  
  const handleMoreEmojisPress = () => {
    setShowEmojiPicker(true);
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <Text
          key={index}
          style={[styles.messageText, styles.linkText, message.isOwn && styles.ownMessageText]}
          onPress={() => Linking.openURL(part).catch(() => Alert.alert('Erro', 'Não foi possível abrir o link'))}
        >
          {part}
        </Text>
      ) : (
        <Text key={index} style={[styles.messageText, message.isOwn && styles.ownMessageText]}>
          {part}
        </Text>
      )
    );
  };

  const renderReactions = React.useMemo(() => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) return null;

    const reactionEntries = Object.entries(message.reactions).sort((a, b) => b[1].length - a[1].length);
    const visibleReactions = reactionEntries.slice(0, MAX_VISIBLE_REACTIONS);

    return (
      <View style={[
        styles.reactionsContainer,
        message.isOwn ? styles.ownReactionsContainer : styles.otherReactionsContainer
      ]}>
        {visibleReactions.map(([emoji, users]) => (
          <TouchableOpacity
            key={emoji}
            style={styles.reaction}
            onPress={() => {
              setSelectedEmoji([emoji, users]);
              setShowVisibleReactionDetails(true);
            }}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={styles.reactionCount}>{users.length}</Text>
          </TouchableOpacity>
        ))}
        {hiddenReactions.length > 0 && (
          <TouchableOpacity
            style={styles.reaction}
            onPress={() => setShowReactionDetails(true)}
          >
            <Text style={styles.reactionEmoji}>+{hiddenReactions.length}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [message.reactions, onAddReaction, message._id, hiddenReactions]);

  const backgroundColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      message.isOwn ? '#1e4687ff' : 'rgba(255, 255, 255, 0.1)',
      '#ffd700',
    ],
  });

  return (
    <View style={[styles.messageContainer, message.isOwn && styles.ownMessageContainer]}>
      {showReplyIcon && (
        <View
          style={[styles.replyIcon, message.isOwn ? styles.replyIconLeft : styles.replyIconRight]}
        >
          <Text style={styles.replyIconText}>↩️</Text>
        </View>
      )}

      <Animated.View
        style={[styles.animatedContainer, { transform: [{ translateX: swipeX }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.touchableContainer}
          onPress={handlePress}
          onLongPress={handleLongPress}
          onPressIn={handlePressIn}
          activeOpacity={0.7}
        >
          <View style={styles.bubbleWrapper}>
            <Animated.View
              style={[styles.messageBubble, message.isOwn && styles.ownMessageBubble, { backgroundColor }]}
            >
              {message.replyTo && (
                <TouchableOpacity style={styles.replyBubble} onPress={handleReplyPress}>
                  <View style={styles.replyIndicator} />
                  <View style={styles.replyContent}>
                    <Text style={styles.replyUsername}>{message.replyTo.username}</Text>
                    <Text style={styles.replyText} numberOfLines={2}>
                      {message.replyTo.text}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {!message.isOwn && <Text style={styles.messageUsername}>{message.username}</Text>}

              {message.type === 'text' ? (
                <View style={styles.messageTextContainer}>{renderTextWithLinks(message.text)}</View>
              ) : (
                <AudioMessage
                  message={message}
                  onPlay={onPlayAudio}
                  onPause={onPauseAudio}
                  onStop={onStopAudio}
                  playingId={playingId}
                  audioPosition={audioPosition}
                  audioDuration={audioDuration}
                />
              )}

              <Text style={[styles.messageTime, message.isOwn && styles.ownMessageTime]}>
                {formatTime(new Date(message.timestamp))}
              </Text>
            </Animated.View>

            {renderReactions}
          </View>

       
          <EmojiSelector
            isVisible={isSelected}
            isOwnMessage={message.isOwn}
            onEmojiPress={handleEmojiSelect}
            onMoreEmojisPress={handleMoreEmojisPress}
            showBelow={true}
          />
        </TouchableOpacity>
      </Animated.View>

      <EmojiPickerModal
        visible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onSelect={(emoji) => {
          handleEmojiSelect(emoji);
          setShowEmojiPicker(false);
        }}
      />
      
      <ReactionDetailsModal
        visible={showReactionDetails}
        onClose={() => setShowReactionDetails(false)}
        allReactions={message.reactions ? Object.entries(message.reactions) : []}
      />
      
      <ReactionDetailsModal
        visible={showVisibleReactionDetails}
        onClose={() => {
          setShowVisibleReactionDetails(false);
          setSelectedEmoji(null);
        }}
        allReactions={selectedEmoji ? [selectedEmoji] : []}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: { 
    marginBottom: 16, 
    alignItems: 'flex-start', 
    position: 'relative' 
  },
  ownMessageContainer: { 
    alignItems: 'flex-end' 
  },
  animatedContainer: {
    maxWidth: Math.max(windowWidth * 0.8, 200),
    minWidth: Math.min(windowWidth * 0.2, 100),
  },
  touchableContainer: { 
    position: 'relative' 
  },
  bubbleWrapper: {
    position: 'relative',
  },
  replyIcon: {
    position: 'absolute',
    top: '50%',
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -15,
  },
  replyIconLeft: { 
    left: -40 
  },
  replyIconRight: { 
    right: -40 
  },
  replyIconText: { 
    fontSize: 16 
  },
  messageBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: Math.max(windowWidth * 0.03, 8),
    margin: 4
  },
  ownMessageBubble: { 
    backgroundColor: '#3b82f6' 
  },
  messageUsername: {
    fontSize: Math.max(windowWidth * 0.03, MIN_FONT_SIZE),
    fontFamily: 'Inter-SemiBold',
    color: '#1dca3aff',
    marginBottom: 4,
  },
  messageTextContainer: { 
    marginBottom: 3
  },
  messageText: {
    fontSize: Math.max(windowWidth * 0.04, MIN_FONT_SIZE),
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    lineHeight: Math.max(windowWidth * 0.05, MIN_FONT_SIZE + 2),
  },
  ownMessageText: { 
    color: '#ffffff' 
  },
  linkText: { 
    color: '#09ee28ff', 
    textDecorationLine: 'underline' 
  },
  messageTime: {
    fontSize: Math.max(windowWidth * 0.025, MIN_FONT_SIZE),
    fontFamily: 'Inter-Regular',
    color: '#7b818aff',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  ownMessageTime: { 
    color: 'rgba(255, 255, 255, 0.7)' 
  },
  replyBubble: {
    flexDirection: 'row',
    backgroundColor: 'rgba(249, 226, 226, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  replyIndicator: { 
    width: 4, 
    backgroundColor: '#d8d822ff' 
  },
  replyContent: { 
    flex: 1, 
    padding: 8 
  },
  replyUsername: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginBottom: 2,
  },
  replyText: { 
    color: '#fff', 
    fontSize: 12, 
    fontFamily: 'Inter-Regular' 
  },
  reactionsContainer: {
    position: 'absolute',
    bottom: -20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: windowWidth * 0.6,
    zIndex: 2,
  },
  ownReactionsContainer: {
    right: 8,
  },
  otherReactionsContainer: {
    left: 8,
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38, 182, 146, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
    marginBottom: 4,
    shadowColor: '#ffffff',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  reactionEmoji: { 
    fontSize: 14, 
  },
  reactionCount: {
    fontSize: 11,
    color: '#1d7ea2ff',
    marginLeft: 4,
    fontFamily: 'Inter-Medium',
  },
});

