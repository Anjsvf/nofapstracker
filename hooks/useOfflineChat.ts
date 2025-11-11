
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { databaseManager } from '../data/database';
import { messageRepository } from '../data/messageRepository';
import { BadgeService } from '../services/badgeService';
import { networkManager } from '../services/networkManager';
import { syncService } from '../services/syncService';
import { Message, User } from '../types';
import { API_URL } from '../utils/api';
import { createOfflineMessage, generateTempId } from '../utils/messageUtils';
import { connectWithBadge, socket } from '../utils/socket';

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number = 15000): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Request timeout'));
    }, timeoutMs);

    fetch(url, options)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
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

  const listenersSetupRef = useRef(false);
  const socketConnectedRef = useRef(false);
  const lastFetchRef = useRef<number>(0);
  const appStateRef = useRef(AppState.currentState);
  const isFetchingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);
  const currentUsernameRef = useRef(username);
  const currentStreakRef = useRef(currentStreak || 0);
  const refreshMessagesRef = useRef<(() => Promise<void>) | null>(null);
  
  useEffect(() => {
    currentUsernameRef.current = username;
  }, [username]);

 
  useEffect(() => {
    const newStreak = currentStreak || 0;
    if (currentStreakRef.current !== newStreak) {
      console.log(`💎 Streak atualizada no hook: ${currentStreakRef.current} → ${newStreak}`);
      currentStreakRef.current = newStreak;
      
    
      if (socketConnectedRef.current && socket.connected) {
        const badge = BadgeService.getBadgeInfo(newStreak);
        socket.emit('updateBadge', {
          badge: badge ? {
            key: badge.key,
            name: badge.name,
            days: badge.days,
            category: badge.category,
          } : null,
          currentStreak: newStreak,
        });
        console.log('💎 Badge atualizada via socket:', badge?.name || 'Nenhuma');
      }
    }
  }, [currentStreak]);

  const ensureIsOwn = useCallback((msg: Message): Message => {
    const timestamp = msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp);
    
    return {
      ...msg,
      isOwn: msg.username === currentUsernameRef.current,
      timestamp: timestamp,
      reactions: msg.reactions || {},
    };
  }, []);

  const fetchMissedMessages = useCallback(async (force: boolean = false) => {
    if (!networkManager.isOnline() || !currentUsernameRef.current) {
      console.log('⏸️ Fetch ignorado: offline ou sem username');
      return;
    }
    
    const now = Date.now();
    if (!force && (now - lastFetchRef.current) < 10000) {
      console.log('⏳ Fetch throttled (< 10s)');
      return;
    }

    if (isFetchingRef.current) {
      console.log('⏸️ Fetch já em progresso');
      return;
    }

    isFetchingRef.current = true;
    lastFetchRef.current = now;

    try {
      console.log('🔍 Buscando mensagens perdidas...');
      
      const lastSync = await messageRepository.getLastSyncTimestamp();
      let since: string | undefined;
      
      if (lastSync) {
        since = lastSync.toISOString();
        console.log(`📅 Since (lastSync): ${since}`);
      }

      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.error('❌ Token não encontrado');
        throw new Error('Token de autenticação não encontrado');
      }

      let url = `${API_URL}/api/messages?limit=100`;
      if (since) {
        url += `&since=${encodeURIComponent(since)}`;
      }

      console.log('🌐 Fetch URL:', url);

      const response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        15000
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data)) {
        console.error('❌ Resposta inválida do servidor:', data);
        throw new Error('Resposta do servidor inválida');
      }

      const serverMessages: Message[] = data.map((msg: any) => ({
        ...msg,
        isOwn: msg.username === currentUsernameRef.current,
        timestamp: new Date(msg.timestamp),
        isSynced: true,
        isPending: false,
        tempId: null,
        reactions: msg.reactions || {},
      }));

      console.log('📨 Mensagens do servidor:', serverMessages.length);

      if (serverMessages.length > 0) {
        console.log('🔄 Chamando messageRepository.upsertMessagesBatch...');
        await messageRepository.upsertMessagesBatch(serverMessages);
        console.log('✅ Batch upsert concluído.');

        await messageRepository.updateLastSyncTimestamp(new Date());
        console.log('⏰ Timestamp de sincronização atualizado.');
        
        const allMessages = await messageRepository.getAllMessages();
        const processedMessages = allMessages.map(ensureIsOwn);
        
        setMessages(processedMessages);
        console.log(`📱 State atualizado: ${processedMessages.length} msgs`);
      } else {
        console.log('📭 Nenhuma nova mensagem do servidor.');
      }

    } catch (error: any) {
      console.error('❌ Erro ao buscar mensagens:', {
        message: error?.message || 'Erro desconhecido',
        name: error?.name || 'Error',
        stack: error?.stack?.substring(0, 200)
      });
    } finally {
      isFetchingRef.current = false;
    }
  }, [ensureIsOwn]);

  const refreshMessages = useCallback(async () => {
    console.log('🔄 refreshMessages chamado');
    
    if (!networkManager.isOnline()) {
      console.log('⚠️ Offline - refresh cancelado');
      return;
    }
    
    try {
      await fetchMissedMessages(true);
      const allMessages = await messageRepository.getAllMessages();
      setMessages(allMessages.map(ensureIsOwn));
      console.log('✅ Refresh manual concluído');
    } catch (error: any) {
      console.error('❌ Erro no refresh manual:', error);
    }
  }, [fetchMissedMessages, ensureIsOwn]);

  useEffect(() => {
    refreshMessagesRef.current = refreshMessages;
  }, [refreshMessages]);

  const handleSync = useCallback(async () => {
    if (!networkManager.isOnline()) {
      Alert.alert('Offline', 'Conecte-se à internet para sincronizar');
      return;
    }

    if (isSyncing) return;

    setIsSyncing(true);
    try {
      await fetchMissedMessages(true);
      await syncService.syncWithServer(currentUsernameRef.current);
      
      const allMessages = await messageRepository.getAllMessages();
      setMessages(allMessages.map(ensureIsOwn));
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      Alert.alert('Erro', 'Falha na sincronização');
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, fetchMissedMessages, ensureIsOwn]);

  const handleMessagesCleanup = useCallback(
    async (data: { deletedCount: number; cutoffDate: string }) => {
      console.log(`🗑️ Limpeza recebida: ${data.deletedCount} mensagens`);
      try {
        const cutoffDate = new Date(data.cutoffDate);
        const deletedLocal = await messageRepository.deleteOldMessages(cutoffDate);
        console.log(`🗑️ Deletadas localmente: ${deletedLocal}`);
        
        const updatedMessages = await messageRepository.getAllMessages();
        setMessages(updatedMessages.map(ensureIsOwn));
      } catch (error) {
        console.error('❌ Erro ao processar limpeza:', error);
      }
    },
    [ensureIsOwn]
  );

  const handleNewMessage = useCallback(
    async (msg: Message) => {
      const processed = ensureIsOwn({
        ...msg,
        isPending: false,
        isSynced: true,
      });

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) {
          return prev;
        }
        return [...prev, processed];
      });
      
      messageRepository.saveMessage(processed, false).catch(err => {
        console.error('❌ Erro ao salvar msg no DB:', err);
      });
    },
    [ensureIsOwn]
  );
  
  const handleMessageUpdated = useCallback(
    async (updated: Message) => {
      const processed = ensureIsOwn(updated);

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updated._id ? processed : msg
        )
      );

      messageRepository.updateMessage(updated._id, {
        reactions: processed.reactions,
      }).catch(err => console.error('❌ Erro ao atualizar DB:', err));
    },
    [ensureIsOwn]
  );

  const handleOnlineUsers = useCallback((users: Array<{ username: string; badge?: any; currentStreak?: number }>) => {
    const userObjects: User[] = users.map(u => ({
      username: u.username,
      online: true,
      badge: u.badge || null,
      currentStreak: u.currentStreak || 0,
    }));
    
    setOnlineUsers(userObjects);
    console.log('👥 Usuários online atualizados:', userObjects.length);
  }, []);

  
  const handleConnect = useCallback(async () => {
    console.log('✅ WebSocket conectado');
    socketConnectedRef.current = true;
    
    if (currentUsernameRef.current) {
     
      const badge = BadgeService.getBadgeInfo(currentStreakRef.current);
      
      connectWithBadge(
        currentUsernameRef.current,
        badge ? {
          key: badge.key,
          name: badge.name,
          days: badge.days,
          category: badge.category,
        } : null,
        currentStreakRef.current
      );
      
      console.log('💎 Conectado com badge:', badge?.name || 'Nenhuma', '- Streak:', currentStreakRef.current);
      
      if (!initialFetchDoneRef.current) {
        initialFetchDoneRef.current = true;
        setTimeout(() => fetchMissedMessages(true), 500);
      }
    }
  }, [fetchMissedMessages]);

  const handleConnectError = useCallback((err: any) => {
    console.error('❌ Erro no WebSocket:', err.message);
    socketConnectedRef.current = false;
  }, []);

  const handleAppStateChange = useCallback(
    async (nextAppState: string) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App voltou ao foreground');
        if (isInitialized && networkManager.isOnline()) {
          try {
            await fetchMissedMessages(true);
            const pendingMessages = await messageRepository.getPendingMessages();
            if (pendingMessages.length > 0) {
              await handleSync();
            }
          } catch (error) {
            console.error('❌ Erro no app state change:', error);
          }
        }
      }
      appStateRef.current = nextAppState;
    },
    [isInitialized, fetchMissedMessages, handleSync]
  );

 
  useEffect(() => {
    const initDatabase = async () => {
      if (!isInitialized) {
        try {
          console.log('💾 Inicializando banco de dados...');
          await databaseManager.init();
          const localMessages = await messageRepository.getAllMessages();
          
          const processedMessages = localMessages.map(ensureIsOwn);
          setMessages(processedMessages);
          setIsInitialized(true);

          if (networkManager.isOnline()) {
            setTimeout(() => fetchMissedMessages(true), 1500);
          }
        } catch (error) {
          console.error('❌ Erro ao inicializar banco:', error);
          Alert.alert('Erro', 'Falha ao inicializar banco de dados');
        }
      }
    };
    initDatabase();
  }, [isInitialized, fetchMissedMessages, ensureIsOwn]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [handleAppStateChange]);

  useEffect(() => {
    if (!isInitialized) return;

    const handleNetworkChange = async (online: boolean) => {
      console.log('🌐 Rede mudou:', online ? 'ONLINE' : 'OFFLINE');
      if (online) {
        if (!socketConnectedRef.current) {
          socket.connect();
        }
        setTimeout(async () => {
          try {
            await fetchMissedMessages(true);
            const pendingMessages = await messageRepository.getPendingMessages();
            if (pendingMessages.length > 0 && !isSyncing) {
              await handleSync();
            }
          } catch (error) {
            console.error('❌ Erro no network change:', error);
          }
        }, 1000);
      }
    };

    const unsubscribe = networkManager.onNetworkChange(handleNetworkChange);
    return () => unsubscribe();
  }, [isInitialized, isSyncing, fetchMissedMessages, handleSync]);

  useEffect(() => {
    if (!currentUsernameRef.current || !isInitialized) return;

    if (!listenersSetupRef.current) {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('messagesCleanup', handleMessagesCleanup);

      socket.on('connect', handleConnect);
      socket.on('connect_error', handleConnectError);
      socket.on('newMessage', handleNewMessage);
      socket.on('messageUpdated', handleMessageUpdated);
      socket.on('onlineUsers', handleOnlineUsers);
      socket.on('messagesCleanup', handleMessagesCleanup);

      listenersSetupRef.current = true;
    }

    if (!socket.connected && !socketConnectedRef.current && networkManager.isOnline()) {
      socket.connect();
    } else if (socket.connected && currentUsernameRef.current) {
     
      const badge = BadgeService.getBadgeInfo(currentStreakRef.current);
      connectWithBadge(
        currentUsernameRef.current,
        badge ? {
          key: badge.key,
          name: badge.name,
          days: badge.days,
          category: badge.category,
        } : null,
        currentStreakRef.current
      );
      socketConnectedRef.current = true;
    }
  }, [isInitialized, handleConnect, handleConnectError, handleNewMessage, handleMessageUpdated, handleOnlineUsers, handleMessagesCleanup]);

  useEffect(() => {
    if (!isInitialized || !currentUsernameRef.current) return;

    const interval = setInterval(async () => {
      if (networkManager.isOnline() && !isSyncing) {
        try {
          await fetchMissedMessages(false);
        } catch (error) {
          console.error('❌ Erro na sincronização periódica:', error);
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isInitialized, isSyncing, fetchMissedMessages]);

  useEffect(() => {
    return () => {
      socket.off('connect', handleConnect);
      socket.off('connect_error', handleConnectError);
      socket.off('newMessage', handleNewMessage);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.off('messagesCleanup', handleMessagesCleanup);
      listenersSetupRef.current = false;
      socketConnectedRef.current = false;
    };
  }, [handleConnect, handleConnectError, handleNewMessage, handleMessageUpdated, handleOnlineUsers, handleMessagesCleanup]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !currentUsernameRef.current) return;
    
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

    const messageWithId: Message = {
      ...offlineMsg,
      _id: tempId,
      isOwn: true,
      isPending: !networkManager.isOnline(),
      timestamp: new Date(offlineMsg.timestamp),
      reactions: {},
    };

    setMessages((prev) => [...prev, messageWithId]);
    setInputText('');
    setReplyingTo(null);

    try {
      if (networkManager.isOnline()) {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            type: 'text',
            replyTo: replyingTo?._id || null,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

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

        setMessages((prev) => 
          prev.map((msg) => 
            msg._id === tempId || msg.tempId === tempId ? serverMsg : msg
          )
        );
      } else {
        await messageRepository.saveMessage(messageWithId, true);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      await messageRepository.saveMessage({ ...messageWithId, isPending: true }, true); 
      Alert.alert('Erro', 'Mensagem salva offline');
    }
  }, [inputText, replyingTo]);

  const sendVoiceMessage = useCallback(
    async (audioUri: string, audioDuration: number, messageText = '[Mensagem de voz]') => {
      if (!currentUsernameRef.current) return;

      const tempId = generateTempId();

      const offlineMsg = createOfflineMessage(
        messageText,
        currentUsernameRef.current,
        'voice',
        audioUri,
        audioDuration,
        replyingTo?._id
      );

      const messageWithId: Message = {
        ...offlineMsg,
        _id: tempId,
        isOwn: true,
        isPending: !networkManager.isOnline(),
        timestamp: new Date(offlineMsg.timestamp),
        reactions: {},
      };

      setMessages((prev) => [...prev, messageWithId]);
      setReplyingTo(null);

      try {
        if (networkManager.isOnline()) {
          const token = await AsyncStorage.getItem('token');
          const formData = new FormData();
          formData.append('audio', { uri: audioUri, type: 'audio/m4a', name: `recording-${tempId}.m4a` } as any);
          formData.append('text', messageText);
          formData.append('type', 'voice');
          formData.append('audioDuration', String(audioDuration));
          if (replyingTo) {
            formData.append('replyTo', replyingTo._id);
          }

          const response = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

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
          setMessages((prev) => 
            prev.map((msg) => 
              msg._id === tempId || msg.tempId === tempId ? serverMsg : msg
            )
          );
        } else {
          await messageRepository.saveMessage(messageWithId, true);
        }
      } catch (error) {
        console.error('❌ Erro ao enviar áudio:', error);
        await messageRepository.saveMessage({ ...messageWithId, isPending: true }, true);
        Alert.alert('Erro', 'Áudio salvo offline');
      }
    },
    [replyingTo]
  );
  
  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const message = await messageRepository.getMessageById(messageId);
        if (!message) return;

        const reactions = { ...message.reactions };
        const users = reactions[emoji] || [];
        const userIndex = users.indexOf(currentUsernameRef.current);

        if (userIndex === -1) {
          reactions[emoji] = [...users, currentUsernameRef.current];
        } else {
          const newUsers = users.filter((u) => u !== currentUsernameRef.current);
          if (newUsers.length === 0) {
            delete reactions[emoji]; 
          } else {
            reactions[emoji] = newUsers;
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? ensureIsOwn({ ...msg, reactions }) : msg
          )
        );

        await messageRepository.updateMessage(messageId, { reactions });

        if (networkManager.isOnline()) {
          const token = await AsyncStorage.getItem('token');
          await fetch(`${API_URL}/api/messages/reaction`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, emoji, username: currentUsernameRef.current }),
          });
        } else {
          await syncService.addReactionOffline(messageId, emoji, currentUsernameRef.current);
        }
      } catch (error) {
        console.error('❌ Erro ao adicionar reação:', error);
        const fallbackMessages = await messageRepository.getAllMessages();
        setMessages(fallbackMessages.map(ensureIsOwn));
      }
    },
    [ensureIsOwn]
  );

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
    refreshMessages: useCallback(async () => {
      if (refreshMessagesRef.current) {
        await refreshMessagesRef.current();
      }
    }, []),
    isOnline: networkManager.isOnline(),
  };
};