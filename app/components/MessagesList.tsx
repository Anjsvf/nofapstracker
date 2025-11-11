
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { userBadgeCache } from '../../services/UserBadgeCache';
import { Message, User } from '../../types';
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
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  onlineUsers?: User[];
}

type ReplyToData = Pick<Message, '_id' | 'username' | 'text' | 'type' | 'timestamp'>;

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
  onlineUsers = [],
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

  
  const [offlineBadges, setOfflineBadges] = useState<Record<string, string | null>>({});
  const [loadingBadges, setLoadingBadges] = useState<Set<string>>(new Set());

  
  const offlineUsernames = useMemo(() => {
    const onlineSet = new Set(onlineUsers.map(u => u.username));
    const authors = new Set<string>();
    messages.forEach(msg => {
      if (!onlineSet.has(msg.username)) {
        authors.add(msg.username);
      }
    });
    return Array.from(authors);
  }, [messages, onlineUsers]);

  
  useEffect(() => {
    const loadBadges = async () => {
      const usernamesToLoad = offlineUsernames.filter(
        username => offlineBadges[username] === undefined
      );

      if (usernamesToLoad.length === 0) return;

     
      setLoadingBadges(new Set(usernamesToLoad));

      console.log(`💎 Carregando badges offline para ${usernamesToLoad.length} usuários...`);

      const badgePromises = usernamesToLoad.map(async (username) => {
        try {
          const badge = await userBadgeCache.getBadge(username);
          return { username, badgeKey: badge?.key || null };
        } catch (error) {
          console.error(`❌ Erro ao carregar badge de ${username}:`, error);
          return { username, badgeKey: null };
        }
      });

      const results = await Promise.all(badgePromises);

      // Atualizar estado com todas as badges de uma vez
      setOfflineBadges(prev => {
        const updated = { ...prev };
        results.forEach(({ username, badgeKey }) => {
          updated[username] = badgeKey;
        });
        return updated;
      });

      // Remover loading
      setLoadingBadges(new Set());

      console.log(` Badges offline carregadas:`, results.length);
    };

    if (offlineUsernames.length > 0) {
      loadBadges().catch(console.error);
    }
  }, [offlineUsernames]);

 
  const userBadgeMap = useMemo(() => {
    const map = new Map<string, string | null>();

   
    onlineUsers.forEach(user => {
      map.set(user.username, user.badge?.key || null);
    });

   
    Object.entries(offlineBadges).forEach(([username, key]) => {
      if (!map.has(username)) {
        map.set(username, key);
      }
    });

    return map;
  }, [onlineUsers, offlineBadges]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) {
      console.log('⚠️ onRefresh não disponível');
      return;
    }
    if (typeof onRefresh !== 'function') {
      console.error('❌ onRefresh não é uma função. Tipo:', typeof onRefresh);
      return;
    }
    try {
      console.log('🔄 Iniciando pull-to-refresh...');
      await Promise.resolve(onRefresh());
      console.log('✅ Pull-to-refresh concluído');
    } catch (error: any) {
      console.error('❌ Erro no handleRefresh:', {
        message: error?.message,
        name: error?.name,
        stack: error?.stack?.substring(0, 200),
      });
    }
  }, [onRefresh]);

  const handleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessageId(prev => prev === messageId ? null : messageId);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedMessageId(null);
  }, []);

  const createReplyToData = (msg: Message): ReplyToData => ({
    _id: msg._id,
    username: msg.username,
    text: msg.text,
    type: msg.type,
    timestamp: msg.timestamp,
  });

  const resolvedMessages = useMemo<Message[]>(() => {
    const messageMap = new Map<string, Message>();
    messages.forEach(msg => {
      messageMap.set(msg._id, msg);
      if (msg.tempId) {
        messageMap.set(msg.tempId, msg);
      }
    });
    return messages.map(message => {
      if (message.replyTo && typeof message.replyTo === 'object') {
        return message;
      }
      if (message.replyTo && typeof message.replyTo === 'string') {
        const replyToMessage = messageMap.get(message.replyTo);
        if (replyToMessage) {
          return {
            ...message,
            replyTo: createReplyToData(replyToMessage),
          };
        } else {
          return {
            ...message,
            replyTo: {
              _id: message.replyTo,
              username: 'Usuário Desconhecido',
              text: 'Mensagem não encontrada',
              type: 'text' as const,
              timestamp: new Date(),
            } as ReplyToData,
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

  const uniqueMessages = useMemo<Message[]>(() =>
    resolvedMessages
      .filter(msg => msg && msg._id)
      .reduce<Message[]>((acc, msg) => {
        if (!acc.some(m => m._id === msg._id)) {
          acc.push(msg);
        }
        return acc;
      }, []),
  [resolvedMessages]);

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
              enabled={true}
            />
          ) : undefined
        }
      >
       
        {loadingBadges.size > 0 && (
          <View style={styles.loadingBadgesContainer}>
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text style={styles.loadingBadgesText}>
              Carregando badges...
            </Text>
          </View>
        )}

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
              userBadge={userBadgeMap.get(message.username) || null}
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
  loadingBadgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  loadingBadgesText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
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