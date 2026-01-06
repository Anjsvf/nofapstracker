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

const { height: windowHeight } = Dimensions.get('window');
const NEAR_BOTTOM_THRESHOLD = 150; // pixels de tolerância para considerar "no final"

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
  const previousMessagesLength = useRef(messages.length);
  const contentHeight = useRef(0);
  const lastContentOffset = useRef(0);
  const lastSeenMessageCount = useRef(messages.length);

  const [offlineBadges, setOfflineBadges] = useState<Record<string, string | null>>({});
  const [loadingBadges, setLoadingBadges] = useState<Set<string>>(new Set());

  // === Badges offline ===
  const offlineUsernames = useMemo(() => {
    const onlineSet = new Set(onlineUsers.map((u) => u.username));
    const authors = new Set<string>();
    messages.forEach((msg) => {
      if (!onlineSet.has(msg.username)) {
        authors.add(msg.username);
      }
    });
    return Array.from(authors);
  }, [messages, onlineUsers]);

  useEffect(() => {
    const loadBadges = async () => {
      const usernamesToLoad = offlineUsernames.filter(
        (username) => offlineBadges[username] === undefined
      );
      if (usernamesToLoad.length === 0) return;

      setLoadingBadges(new Set(usernamesToLoad));

      const badgePromises = usernamesToLoad.map(async (username) => {
        try {
          const badge = await userBadgeCache.getBadge(username);
          return { username, badgeKey: badge?.key || null };
        } catch (error) {
          console.error(`Erro ao carregar badge de ${username}:`, error);
          return { username, badgeKey: null };
        }
      });

      const results = await Promise.all(badgePromises);

      setOfflineBadges((prev) => {
        const updated = { ...prev };
        results.forEach(({ username, badgeKey }) => {
          updated[username] = badgeKey;
        });
        return updated;
      });

      setLoadingBadges(new Set());
    };

    if (offlineUsernames.length > 0) {
      loadBadges().catch(console.error);
    }
  }, [offlineUsernames, offlineBadges]);

  const userBadgeMap = useMemo(() => {
    const map = new Map<string, string | null>();
    onlineUsers.forEach((user) => {
      map.set(user.username, user.badge?.key || null);
    });
    Object.entries(offlineBadges).forEach(([username, key]) => {
      if (!map.has(username)) {
        map.set(username, key);
      }
    });
    return map;
  }, [onlineUsers, offlineBadges]);

  // === Handlers ===
  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    try {
      await onRefresh();
    } catch (error) {
      console.error('Erro no pull-to-refresh:', error);
    }
  }, [onRefresh]);

  const handleMessageSelection = useCallback((messageId: string) => {
    setSelectedMessageId((prev) => (prev === messageId ? null : messageId));
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedMessageId(null);
  }, []);

  const createReplyToData = (msg: Message): ReplyToData => ({
    _id: msg._id,
    username: msg.username,
    text: msg.text ?? '',
    type: msg.type,
    timestamp: msg.timestamp,
  });

  // === Resolução de replyTo ===
  const resolvedMessages = useMemo<Message[]>(() => {
    const messageMap = new Map<string, Message>();
    messages.forEach((msg) => {
      messageMap.set(msg._id, msg);
      if (msg.tempId) messageMap.set(msg.tempId, msg);
    });

    return messages.map((message) => {
      if (!message.replyTo) return message;
      if (typeof message.replyTo === 'object') return message;

      const replyToMessage = messageMap.get(message.replyTo as string);
      if (replyToMessage) {
        return { ...message, replyTo: createReplyToData(replyToMessage) };
      }

      return {
        ...message,
        replyTo: {
          _id: message.replyTo as string,
          username: 'Usuário Desconhecido',
          text: 'Mensagem não encontrada',
          type: 'text',
          timestamp: new Date(),
        } as ReplyToData,
      };
    });
  }, [messages]);

  // === Auto-scroll e unread count ===
  useEffect(() => {
    const newMessagesCount = messages.length;
    const addedMessages = newMessagesCount - previousMessagesLength.current;

    if (addedMessages > 0 && shouldAutoScroll.current) {
      // Novas mensagens e usuário estava no final → scroll automático
      scrollViewRef.current?.scrollToEnd({ animated: true });
      lastSeenMessageCount.current = newMessagesCount;
      setUnreadCount(0);
    } else if (addedMessages > 0 && !shouldAutoScroll.current) {
      // Usuário estava lendo histórico → aumenta contador de não lidas
      setUnreadCount((prev) => prev + addedMessages);
    }

    previousMessagesLength.current = newMessagesCount;
  }, [messages.length, scrollViewRef]);

  // Scroll inicial
  useEffect(() => {
    if (messages.length > 0 && previousMessagesLength.current === 0) {
      // Primeira carga
      scrollViewRef.current?.scrollToEnd({ animated: false });
      lastSeenMessageCount.current = messages.length;
    }
  }, []);

  // === Posições das mensagens (para scrollToMessage) ===
  const handleMessageLayout = useCallback((messageId: string, y: number) => {
    messagePositions.current.set(messageId, y);
  }, []);

  const scrollToMessage = useCallback(
    (messageId: string) => {
      if (!messageId) return;

      const position = messagePositions.current.get(messageId);
      if (position !== undefined && scrollViewRef.current) {
        shouldAutoScroll.current = false;
        setHighlightedMessageId(messageId);

        const offsetFromTop = 120;
        const targetY = Math.max(0, position - offsetFromTop);

        scrollViewRef.current.scrollTo({ y: targetY, animated: true });

        // Volta auto-scroll após 4s
        setTimeout(() => {
          setHighlightedMessageId(null);
          shouldAutoScroll.current = true;
        }, 4000);
      }
    },
    [scrollViewRef]
  );

  // === Scroll behavior ===
  const handleScroll = useCallback(
    (event: any) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const offsetY = contentOffset.y;
      const isNearBottom =
        offsetY + layoutMeasurement.height >= contentSize.height - NEAR_BOTTOM_THRESHOLD;

      const wasNearBottom = shouldAutoScroll.current;
      shouldAutoScroll.current = isNearBottom;

      // Limpa seleção se rolar rápido
      if (selectedMessageId && Math.abs(event.nativeEvent.velocity?.y || 0) > 0.5) {
        setSelectedMessageId(null);
      }

      // Atualiza botão de scroll to bottom
      const shouldShowButton = !isNearBottom && contentSize.height > layoutMeasurement.height;
      if (shouldShowButton !== showScrollToBottom) {
        setShowScrollToBottom(shouldShowButton);
        Animated.timing(scrollButtonOpacity, {
          toValue: shouldShowButton ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }

      // Se chegou no final, zera unread
      if (isNearBottom && !wasNearBottom) {
        setUnreadCount(0);
        lastSeenMessageCount.current = messages.length;
      }

      lastContentOffset.current = offsetY;
    },
    [
      showScrollToBottom,
      scrollButtonOpacity,
      selectedMessageId,
      messages.length,
    ]
  );

  const handleContentSizeChange = useCallback(
    (width: number, height: number) => {
      // Só scroll automático se o conteúdo cresceu e o usuário estava perto do final
      if (height > contentHeight.current && shouldAutoScroll.current) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
      contentHeight.current = height;
    },
    [scrollViewRef]
  );

  const scrollToBottomWithButton = useCallback(() => {
    shouldAutoScroll.current = true;
    setUnreadCount(0);
    lastSeenMessageCount.current = messages.length;
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [scrollViewRef, messages.length]);

  // === Remoção de duplicatas (O(n)) ===
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return resolvedMessages.filter((msg) => {
      if (!msg._id || seen.has(msg._id)) return false;
      seen.add(msg._id);
      return true;
    });
  }, [resolvedMessages]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#3b82f6"
              colors={['#3b82f6']}
            />
          ) : undefined
        }
      >
        {uniqueMessages.map((message) => (
          <View
            key={message._id}
            style={[
              styles.messageWrapper,
              highlightedMessageId === message._id && styles.highlightedMessage,
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

      {/* Overlay fixo para loading de badges (opcional, mais visível) */}
      {loadingBadges.size > 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.loadingText}>Carregando badges...</Text>
        </View>
      )}

      {/* Botão scroll to bottom */}
      {showScrollToBottom && (
        <Animated.View style={[styles.scrollToBottomButton, { opacity: scrollButtonOpacity }]}>
          <TouchableOpacity onPress={scrollToBottomWithButton} style={styles.scrollButtonTouchable}>
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
    paddingBottom: windowHeight * 0.02,
  },
  messageWrapper: {
    overflow: 'visible',
  },
  highlightedMessage: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 12,
    marginHorizontal: 4,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
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
    shadowOffset: { width: 0, height: 2 },
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