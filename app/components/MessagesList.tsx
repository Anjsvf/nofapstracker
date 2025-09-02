import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Message } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessagesListProps {
  messages: Message[];
  onPlayAudio?: (uri: string, messageId: string) => void;
  onPauseAudio?: () => void;
  onStopAudio?: () => void;
  playingId?: string | null;
  audioPosition?: number;
  audioDuration?: number;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onReply?: (message: Message) => void;
  scrollViewRef: React.RefObject<ScrollView>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  autoRefreshOnMount?: boolean; 
}

const { height } = Dimensions.get('window');

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  onPlayAudio,
  onPauseAudio,
  onStopAudio,
  playingId,
  audioPosition,
  audioDuration,
  onAddReaction,
  onReply,
  scrollViewRef,
  onRefresh,
  isRefreshing = false,
  autoRefreshOnMount = true, 
}) => {
  const messagePositions = useRef<Map<string, number>>(new Map());
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollButtonOpacity = useRef(new Animated.Value(0)).current;
  const shouldAutoScroll = useRef(true);
  const messagesCount = useRef(0);
  const isInitialMount = useRef(true);
  const contentHeight = useRef(0);
  const scrollViewHeight = useRef(0);
  const lastSeenMessageCount = useRef(0);
  const hasAutoRefreshed = useRef(false); 

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  
  useEffect(() => {
    if (autoRefreshOnMount && onRefresh && !hasAutoRefreshed.current && isInitialMount.current) {
      
      const timer = setTimeout(() => {
        handleRefresh();
        hasAutoRefreshed.current = true;
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoRefreshOnMount, onRefresh, handleRefresh]);


  const handleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessageId(prev => prev === messageId ? null : messageId);
  }, []);

 
  const handleClearSelection = useCallback(() => {
    setSelectedMessageId(null);
  }, []);

  
  const resolvedMessages = useMemo(() => {
    const messageMap = new Map<string, Message>();
    messages.forEach(msg => {
      messageMap.set(msg._id, msg);
      if (msg.tempId) {
        messageMap.set(msg.tempId, msg);
      }
    });

    return messages.map(message => {
      if (message.replyTo && typeof message.replyTo === 'string') {
        const replyToMessage = messageMap.get(message.replyTo);

        if (replyToMessage) {
          return {
            ...message,
            replyTo: {
              _id: replyToMessage._id,
              username: replyToMessage.username,
              text: replyToMessage.text,
              type: replyToMessage.type,
              timestamp: replyToMessage.timestamp,
            },
          };
        } else {
          return {
            ...message,
            replyTo: {
              _id: message.replyTo,
              username: 'Usuário Desconhecido',
              text: 'Mensagem não encontrada',
              type: 'text',
              timestamp: new Date(),
            },
          };
        }
      }
      return message;
    });
  }, [messages]);

 
  useEffect(() => {
    if (messages.length > 0 && isInitialMount.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
        isInitialMount.current = false;
        messagesCount.current = messages.length;
        lastSeenMessageCount.current = messages.length;
      }, 100);
    }
  }, [messages.length, scrollViewRef]);

 
  useEffect(() => {
    if (!isInitialMount.current && messages.length > messagesCount.current && shouldAutoScroll.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        messagesCount.current = messages.length;
        lastSeenMessageCount.current = messages.length;
      }, 50);
    } else if (!isInitialMount.current) {
      messagesCount.current = messages.length;
      if (!shouldAutoScroll.current && messages.length > lastSeenMessageCount.current) {
        setUnreadCount(messages.length - lastSeenMessageCount.current);
      }
    }
  }, [messages.length, scrollViewRef]);

  const handleMessageLayout = useCallback((messageId: string, y: number) => {
    if (messageId) {
      messagePositions.current.set(messageId, y);
    }
  }, []);

  const scrollToBottomWithButton = useCallback(() => {
    shouldAutoScroll.current = true;
    setUnreadCount(0);
    lastSeenMessageCount.current = messages.length;
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [scrollViewRef, messages.length]);

  const scrollToMessage = useCallback((messageId: string) => {
    if (!messageId) return;
    const position = messagePositions.current.get(messageId);
    if (position !== undefined && scrollViewRef.current) {
      shouldAutoScroll.current = false;
      setHighlightedMessageId(messageId);
      const offsetFromTop = 100;
      const scrollPosition = Math.max(0, position - offsetFromTop);
      scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
      setTimeout(() => {
        setHighlightedMessageId(null);
        shouldAutoScroll.current = true;
      }, 4000);
    }
  }, [scrollViewRef]);

  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    contentHeight.current = contentSize.height;
    scrollViewHeight.current = layoutMeasurement.height;
    const isNearBottom = (contentOffset.y + layoutMeasurement.height) >= (contentSize.height - 100);
    const wasAutoScrolling = shouldAutoScroll.current;
    shouldAutoScroll.current = isNearBottom;
    const shouldShowButton = !isNearBottom && contentSize.height > layoutMeasurement.height;
    
    
    if (selectedMessageId && Math.abs(event.nativeEvent.velocity?.y || 0) > 0.5) {
      setSelectedMessageId(null);
    }
    
    if (shouldShowButton !== showScrollToBottom) {
      setShowScrollToBottom(shouldShowButton);
      Animated.timing(scrollButtonOpacity, {
        toValue: shouldShowButton ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    if (isNearBottom && !wasAutoScrolling) {
      setUnreadCount(0);
      lastSeenMessageCount.current = messages.length;
    }
  }, [scrollButtonOpacity, showScrollToBottom, messages.length, selectedMessageId]);

  const handleContentSizeChange = useCallback((width: number, height: number) => {
    contentHeight.current = height;
    if (isInitialMount.current || shouldAutoScroll.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: !isInitialMount.current });
      }, 10);
    }
  }, [scrollViewRef]);

  
  const uniqueMessages = resolvedMessages
    .filter(msg => msg && msg._id)
    .reduce<Message[]>((acc, msg) => {
      if (!acc.some(m => m._id === msg._id)) {
        acc.push(msg);
      }
      return acc;
    }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={(event) => {
          scrollViewHeight.current = event.nativeEvent.layout.height;
        }}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
              title="Atualizando chat..."
              titleColor="#ffffff"
              progressBackgroundColor="rgba(255, 255, 255, 0.1)"
            />
          ) : undefined
        }
      >
        {uniqueMessages.map((message) => (
          <View
            key={message._id}
            style={[
              styles.messageWrapper,
              highlightedMessageId === message._id && styles.highlightedMessage
            ]}
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              handleMessageLayout(message._id, y);
            }}
          >
            <MessageBubble
              message={message}
              onPlayAudio={onPlayAudio}
              onPauseAudio={onPauseAudio}
              onStopAudio={onStopAudio}
              playingId={playingId}
              audioPosition={audioPosition}
              audioDuration={audioDuration}
              onAddReaction={onAddReaction}
              onReply={onReply}
              onScrollToMessage={scrollToMessage}
              isSelected={selectedMessageId === message._id}
              onSelectionChange={handleMessageSelection}
              onClearSelection={handleClearSelection}
            />
          </View>
        ))}
      </ScrollView>

      {showScrollToBottom && (
        <Animated.View
          style={[
            styles.scrollToBottomButton,
            { opacity: scrollButtonOpacity }
          ]}
        >
          <TouchableOpacity
            onPress={scrollToBottomWithButton}
            style={styles.scrollButtonTouchable}
            activeOpacity={0.8}
          >
            <Text style={styles.scrollButtonArrow}>↓</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: height * 0.02,
  },
  messageWrapper: {
    overflow: 'visible',
  },
  highlightedMessage: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  scrollButtonTouchable: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#171a18ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollButtonArrow: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  unreadCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});