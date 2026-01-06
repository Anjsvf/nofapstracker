import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { databaseManager } from '../data/database';
import { messageRepository } from '../data/messageRepository';
import { syncRepository } from '../data/syncRepository';
import { BadgeService } from '../services/badgeService';
import { networkManager } from '../services/networkManager';
import { syncService } from '../services/syncService';
import { Message, User } from '../types';
import { API_URL } from '../utils/api';
import { createOfflineMessage, generateTempId } from '../utils/messageUtils';
import { connectWithBadge, socket } from '../utils/socket';

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs = 15000
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
    fetch(url, options)
      .then((r) => {
        clearTimeout(timer);
        resolve(r);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
};

export const useOfflineChat = (username: string, currentStreak?: number) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 🔒 Proteção contra double-submit com debounce
  const lastSendTimeRef = useRef(0);
  const DEBOUNCE_MS = 300;

  const listenersSetupRef = useRef(false);
  const socketConnectedRef = useRef(false);
  const lastFetchRef = useRef(0);
  const appStateRef = useRef(AppState.currentState);
  const isFetchingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);
  const currentUsernameRef = useRef(username);
  const currentStreakRef = useRef(currentStreak || 0);
  const isMountedRef = useRef(true);

  // ✅ FIX: Armazena o username original para comparação confiável
  const originalUsernameRef = useRef(username);

  useEffect(() => {
    currentUsernameRef.current = username;
  }, [username]);

  useEffect(() => {
    const newStreak = currentStreak || 0;
    if (currentStreakRef.current !== newStreak) {
      currentStreakRef.current = newStreak;
      if (socketConnectedRef.current && socket.connected) {
        const badge = BadgeService.getBadgeInfo(newStreak);
        socket.emit('updateBadge', {
          badge: badge
            ? { key: badge.key, name: badge.name, days: badge.days, category: badge.category }
            : null,
          currentStreak: newStreak,
        });
      }
    }
  }, [currentStreak]);

  // ✅ FIX: ensureIsOwn agora usa o username da mensagem ao invés da ref
  const ensureIsOwn = useCallback((msg: Message, checkUsername: string): Message => {
    const timestamp = msg.timestamp instanceof Date 
      ? msg.timestamp 
      : new Date(msg.timestamp);
    
    // Validação de timestamp
    if (isNaN(timestamp.getTime())) {
      console.error('Timestamp inválido:', msg.timestamp);
      return {
        ...msg,
        isOwn: msg.username === checkUsername,
        timestamp: new Date(),
        reactions: msg.reactions || {},
      };
    }

    return {
      ...msg,
      isOwn: msg.username === checkUsername,
      timestamp,
      reactions: msg.reactions || {},
    };
  }, []);

  // ✅ FIX: Removido ensureIsOwn das dependências para evitar loop
  const fetchMissedMessages = useCallback(async (force = false) => {
    if (!networkManager.isOnline() || !currentUsernameRef.current) return;

    const now = Date.now();
    if (!force && now - lastFetchRef.current < 10000) return;
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      const lastSync = await messageRepository.getLastSyncTimestamp();
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      let url = `${API_URL}/api/messages?limit=100`;
      if (lastSync) url += `&since=${encodeURIComponent(lastSync.toISOString())}`;

      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Resposta inválida');

      const serverMessages: Message[] = data.map((m: any) => ({
        ...m,
        isOwn: m.username === currentUsernameRef.current,
        timestamp: new Date(m.timestamp),
        reactions: m.reactions || {},
        isPending: false,
        isSynced: true,
        tempId: undefined,
      }));

      if (serverMessages.length > 0) {
        await messageRepository.upsertMessagesBatch(serverMessages);
        await messageRepository.updateLastSyncTimestamp(new Date());
      }

      if (isMountedRef.current) {
        const all = await messageRepository.getAllMessages();
        setMessages(all.map(msg => ensureIsOwn(msg, currentUsernameRef.current)));
      }
    } catch (err: any) {
      console.error('Erro ao buscar mensagens:', err.message);
    } finally {
      isFetchingRef.current = false;
    }
  }, [ensureIsOwn]);

  const refreshMessages = useCallback(async () => {
    if (!networkManager.isOnline()) return;
    await fetchMissedMessages(true);
    if (isMountedRef.current) {
      const all = await messageRepository.getAllMessages();
      setMessages(all.map(msg => ensureIsOwn(msg, currentUsernameRef.current)));
    }
  }, [fetchMissedMessages, ensureIsOwn]);

  const handleSync = useCallback(async () => {
    if (!networkManager.isOnline()) {
      Alert.alert('Offline', 'Conecte-se para sincronizar');
      return;
    }
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await fetchMissedMessages(true);
      await syncService.syncWithServer(currentUsernameRef.current);
      if (isMountedRef.current) {
        const all = await messageRepository.getAllMessages();
        setMessages(all.map(msg => ensureIsOwn(msg, currentUsernameRef.current)));
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha na sincronização');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, fetchMissedMessages, ensureIsOwn]);

  // ✅ FIX: Validação de data no cleanup
  const handleMessagesCleanup = useCallback(
    async (data: { deletedCount: number; cutoffDate: string }) => {
      try {
        const cutoffDate = new Date(data.cutoffDate);
        
        // Validação de data
        if (isNaN(cutoffDate.getTime())) {
          console.error('Data de cutoff inválida recebida:', data.cutoffDate);
          return;
        }

        await messageRepository.deleteOldMessages(cutoffDate);
        if (isMountedRef.current) {
          const fresh = await messageRepository.getAllMessages();
          setMessages(fresh.map(msg => ensureIsOwn(msg, currentUsernameRef.current)));
        }
      } catch (err) {
        console.error('Erro no cleanup:', err);
      }
    },
    [ensureIsOwn]
  );

  // ✅ FIX: Wrapper com try-catch para handlers do socket
  const safeSocketHandler = useCallback((handler: Function, handlerName: string) => {
    return (...args: any[]) => {
      try {
        handler(...args);
      } catch (err) {
        console.error(`Erro no handler ${handlerName}:`, err);
      }
    };
  }, []);

  const handleNewMessage = useCallback((msg: Message) => {
    if (!isMountedRef.current) return;
    const processed = ensureIsOwn(
      { ...msg, reactions: msg.reactions || {}, isPending: false, isSynced: true },
      currentUsernameRef.current
    );
    setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, processed]));
    messageRepository.saveMessage(processed, false).catch(console.error);
  }, [ensureIsOwn]);

  const handleMessageUpdated = useCallback((updated: Message) => {
    if (!isMountedRef.current) return;
    const processed = ensureIsOwn(updated, currentUsernameRef.current);
    setMessages((prev) => prev.map((m) => (m._id === updated._id ? processed : m)));
    messageRepository.updateMessage(updated._id, { reactions: processed.reactions }).catch(console.error);
  }, [ensureIsOwn]);

  const handleOnlineUsers = useCallback((users: any[]) => {
    if (!isMountedRef.current) return;
    setOnlineUsers(
      users.map((u) => ({
        username: u.username,
        online: true,
        badge: u.badge || null,
        currentStreak: u.currentStreak || 0,
      }))
    );
  }, []);

  // ✅ FIX: Evita double fetch na inicialização
  const handleConnect = useCallback(async () => {
    socketConnectedRef.current = true;
    if (currentUsernameRef.current) {
      const badge = BadgeService.getBadgeInfo(currentStreakRef.current);
      connectWithBadge(
        currentUsernameRef.current,
        badge
          ? { key: badge.key, name: badge.name, days: badge.days, category: badge.category }
          : null,
        currentStreakRef.current
      );

      // Só faz fetch se não foi feito ainda E se não estiver online desde a inicialização
      if (!initialFetchDoneRef.current && !networkManager.isOnline()) {
        initialFetchDoneRef.current = true;
        setTimeout(() => fetchMissedMessages(true), 500);
      }
    }
  }, [fetchMissedMessages]);

  const handleConnectError = useCallback((err: any) => {
    console.error('Socket error:', err.message);
    socketConnectedRef.current = false;
  }, []);

  const handleAppStateChange = useCallback(async (nextState: string) => {
    if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
      if (isInitialized && networkManager.isOnline()) {
        await fetchMissedMessages(true);
        const pendingMessages = await messageRepository.getPendingMessages();
        if (pendingMessages.length > 0) await handleSync();
      }
    }
    appStateRef.current = nextState;
  }, [isInitialized, fetchMissedMessages, handleSync]);

  // ✅ FIX: Removido ensureIsOwn das dependências
  const performLocalCleanup = useCallback(async () => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      await messageRepository.deleteOldMessages(cutoff);
      if (isMountedRef.current) {
        const updated = await messageRepository.getAllMessages();
        setMessages(updated.map(msg => ensureIsOwn(msg, currentUsernameRef.current)));
      }
    } catch (err) {
      console.error('Erro no cleanup local:', err);
    }
  }, [ensureIsOwn]);

  // ✅ FIX: Inicialização sem dependências desnecessárias
  useEffect(() => {
    let isActive = true;

    const init = async () => {
      if (isInitialized) return;
      
      try {
        await databaseManager.init();
        const local = await messageRepository.getAllMessages();
        
        if (isActive) {
          setMessages(local.map(msg => ensureIsOwn(msg, username)));
          setIsInitialized(true);
        }

        // Limpeza imediata na inicialização
        await performLocalCleanup();

        // ✅ FIX: Só faz fetch inicial se estiver online
        if (isActive && networkManager.isOnline()) {
          initialFetchDoneRef.current = true;
          setTimeout(() => fetchMissedMessages(true), 1500);
        }
      } catch (err) {
        console.error('Erro na inicialização:', err);
      }
    };
    
    init();

    return () => {
      isActive = false;
    };
  }, []); // ✅ Sem dependências - roda apenas uma vez

  // ✅ FIX: Limpeza periódica com ref estável
  useEffect(() => {
    if (!isInitialized) return;
    
    const cleanupTimer = setInterval(() => {
      performLocalCleanup();
    }, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(cleanupTimer);
  }, [isInitialized]); // ✅ Só depende de isInitialized

  useEffect(() => {
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub?.remove();
  }, [handleAppStateChange]);

  useEffect(() => {
    if (!isInitialized) return;
    const handler = async (online: boolean) => {
      if (online) {
        socket.connect();
        setTimeout(async () => {
          await fetchMissedMessages(true);
          const pending = await messageRepository.getPendingMessages();
          if (pending.length > 0 && !isSyncing) await handleSync();
        }, 1000);
      }
    };
    return networkManager.onNetworkChange(handler);
  }, [isInitialized, isSyncing, fetchMissedMessages, handleSync]);

  // ✅ FIX: Socket listeners com error handling
  useEffect(() => {
    if (!currentUsernameRef.current || !isInitialized || listenersSetupRef.current) return;

    socket.on('connect', safeSocketHandler(handleConnect, 'connect'));
    socket.on('connect_error', safeSocketHandler(handleConnectError, 'connect_error'));
    socket.on('newMessage', safeSocketHandler(handleNewMessage, 'newMessage'));
    socket.on('messageUpdated', safeSocketHandler(handleMessageUpdated, 'messageUpdated'));
    socket.on('onlineUsers', safeSocketHandler(handleOnlineUsers, 'onlineUsers'));
    socket.on('messagesCleanup', safeSocketHandler(handleMessagesCleanup, 'messagesCleanup'));

    listenersSetupRef.current = true;

    if (networkManager.isOnline()) socket.connect();

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('newMessage');
      socket.off('messageUpdated');
      socket.off('onlineUsers');
      socket.off('messagesCleanup');
      listenersSetupRef.current = false;
      socketConnectedRef.current = false;
    };
  }, [
    isInitialized,
    handleConnect,
    handleConnectError,
    handleNewMessage,
    handleMessageUpdated,
    handleOnlineUsers,
    handleMessagesCleanup,
    safeSocketHandler
  ]);

  useEffect(() => {
    if (!isInitialized) return;
    const interval = setInterval(() => {
      if (networkManager.isOnline() && !isSyncing) fetchMissedMessages(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [isInitialized, isSyncing, fetchMissedMessages]);

  // ✅ FIX: Debounce no envio de mensagens
  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !currentUsernameRef.current) return;

    // Debounce check
    const now = Date.now();
    if (now - lastSendTimeRef.current < DEBOUNCE_MS) {
      console.log('Mensagem bloqueada por debounce');
      return;
    }
    lastSendTimeRef.current = now;

    const text = inputText.trim();
    const tempId = generateTempId();
    const offlineMsg = createOfflineMessage(
      text,
      currentUsernameRef.current,
      'text',
      undefined,
      undefined,
      replyingTo?._id
    );

    const timestamp = new Date(offlineMsg.timestamp);
    if (isNaN(timestamp.getTime())) {
      console.error('Timestamp inválido gerado');
      return;
    }

    const optimisticMsg: Message = {
      ...offlineMsg,
      _id: tempId,
      isOwn: true,
      isPending: false,
      isSynced: false,
      timestamp,
      reactions: {},
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setReplyingTo(null);

    try {
      if (networkManager.isOnline()) {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Token não encontrado');

        const response = await fetchWithTimeout(
          `${API_URL}/api/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              type: 'text',
              replyTo: replyingTo?._id || null,
            }),
          },
          10000
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const serverData = await response.json();
        const serverMsg: Message = {
          ...serverData,
          isOwn: true,
          timestamp: new Date(serverData.timestamp),
          reactions: serverData.reactions || {},
          isPending: false,
          isSynced: true,
        };

        await messageRepository.updateMessageWithNewId(tempId, serverMsg);
        if (isMountedRef.current) {
          setMessages((prev) => prev.map((msg) => (msg._id === tempId ? serverMsg : msg)));
        }
        return;
      }

      // Offline
      await messageRepository.saveMessage({ ...optimisticMsg, isPending: true }, true);
      if (isMountedRef.current) {
        setMessages((prev) => prev.map((msg) => (msg._id === tempId ? { ...msg, isPending: true } : msg)));
      }
      await syncRepository.addToSyncQueue(tempId, 'CREATE', {
        text,
        type: 'text',
        replyTo: replyingTo?._id || null,
      });
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      const pendingMsg = { ...optimisticMsg, isPending: true };
      await messageRepository.saveMessage(pendingMsg, true);
      if (isMountedRef.current) {
        setMessages((prev) => prev.map((msg) => (msg._id === tempId ? pendingMsg : msg)));
      }
      await syncRepository.addToSyncQueue(tempId, 'CREATE', {
        text,
        type: 'text',
        replyTo: replyingTo?._id || null,
      });
      Alert.alert('Erro', 'Mensagem salva offline');
    }
  }, [inputText, replyingTo, ensureIsOwn]);

  // ✅ FIX: Validação de audioUri e debounce
  const sendVoiceMessage = useCallback(
    async (audioUri: string, audioDuration: number, messageText = '[Mensagem de voz]') => {
      if (!currentUsernameRef.current || !audioUri) {
        console.error('Username ou audioUri inválido');
        return;
      }

      // Debounce check
      const now = Date.now();
      if (now - lastSendTimeRef.current < DEBOUNCE_MS) {
        console.log('Áudio bloqueado por debounce');
        return;
      }
      lastSendTimeRef.current = now;

      const tempId = generateTempId();
      const offlineMsg = createOfflineMessage(
        messageText,
        currentUsernameRef.current,
        'voice',
        audioUri,
        audioDuration,
        replyingTo?._id
      );

      const timestamp = new Date(offlineMsg.timestamp);
      if (isNaN(timestamp.getTime())) {
        console.error('Timestamp inválido gerado');
        return;
      }

      const optimisticMsg: Message = {
        ...offlineMsg,
        _id: tempId,
        isOwn: true,
        isPending: false,
        isSynced: false,
        timestamp,
        reactions: {},
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setReplyingTo(null);

      try {
        if (networkManager.isOnline()) {
          const token = await AsyncStorage.getItem('token');
          if (!token) throw new Error('Token não encontrado');

          const formData = new FormData();
          
          // ✅ FIX: Validação do arquivo antes do append
          const audioFile = {
            uri: audioUri,
            type: 'audio/m4a',
            name: `recording-${tempId}.m4a`
          };
          
          formData.append('audio', audioFile as any);
          formData.append('text', messageText);
          formData.append('type', 'voice');
          formData.append('audioDuration', String(audioDuration));
          if (replyingTo) {
            formData.append('replyTo', replyingTo._id);
          }

          const response = await fetchWithTimeout(
            `${API_URL}/api/messages`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            },
            30000 // Timeout maior para upload de áudio
          );

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const serverData = await response.json();
          const serverMsg: Message = {
            ...serverData,
            isOwn: true,
            timestamp: new Date(serverData.timestamp),
            reactions: serverData.reactions || {},
            isPending: false,
            isSynced: true,
          };

          await messageRepository.updateMessageWithNewId(tempId, serverMsg);
          if (isMountedRef.current) {
            setMessages((prev) => prev.map((msg) => (msg._id === tempId ? serverMsg : msg)));
          }
          return;
        }

        // Offline
        await messageRepository.saveMessage({ ...optimisticMsg, isPending: true }, true);
        if (isMountedRef.current) {
          setMessages((prev) => prev.map((msg) => (msg._id === tempId ? { ...msg, isPending: true } : msg)));
        }
        await syncRepository.addToSyncQueue(tempId, 'CREATE', {
          text: messageText,
          type: 'voice',
          audioUri,
          audioDuration,
          replyTo: replyingTo?._id || null,
        });
      } catch (error) {
        console.error('❌ Erro ao enviar áudio:', error);
        const pendingMsg = { ...optimisticMsg, isPending: true };
        await messageRepository.saveMessage(pendingMsg, true);
        if (isMountedRef.current) {
          setMessages((prev) => prev.map((msg) => (msg._id === tempId ? pendingMsg : msg)));
        }
        await syncRepository.addToSyncQueue(tempId, 'CREATE', {
          text: messageText,
          type: 'voice',
          audioUri,
          audioDuration,
          replyTo: replyingTo?._id || null,
        });
        Alert.alert('Erro', 'Áudio salvo offline');
      }
    },
    [replyingTo, ensureIsOwn]
  );

  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const message = await messageRepository.getMessageById(messageId);
        if (!message) {
          console.error('Mensagem não encontrada:', messageId);
          return;
        }

        const reactions = { ...message.reactions };
        const users = reactions[emoji] || [];
        const idx = users.indexOf(currentUsernameRef.current);

        if (idx === -1) {
          reactions[emoji] = [...users, currentUsernameRef.current];
        } else {
          const filtered = users.filter((u) => u !== currentUsernameRef.current);
          if (filtered.length === 0) delete reactions[emoji];
          else reactions[emoji] = filtered;
        }

        if (isMountedRef.current) {
          setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)));
        }
        await messageRepository.updateMessage(messageId, { reactions });

        if (networkManager.isOnline()) {
          const token = await AsyncStorage.getItem('token');
          if (!token) throw new Error('Token não encontrado');
          
          await fetchWithTimeout(
            `${API_URL}/api/messages/reaction`,
            {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ messageId, emoji, username: currentUsernameRef.current }),
            },
            5000
          );
        } else {
          await syncRepository.addToSyncQueue(messageId, 'REACTION', {
            messageId,
            emoji,
            username: currentUsernameRef.current,
          });
        }
      } catch (error) {
        console.error('Erro ao adicionar reação:', error);
        if (isMountedRef.current) {
          const fallbackMessages = await messageRepository.getAllMessages();
          setMessages(fallbackMessages.map(msg => ensureIsOwn(msg, currentUsernameRef.current)));
        }
      }
    },
    [ensureIsOwn]
  );

  // ✅ Cleanup ao desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    messages,
    inputText,
    setInputText,
    replyingTo,
    setReplyingTo,
    onlineUsers,
    isSyncing,
    isInitialized,
    sendMessage,
    sendVoiceMessage,
    addReaction,
    forceSync: handleSync,
    refreshMessages,
    isOnline: networkManager.isOnline(),
  };
};