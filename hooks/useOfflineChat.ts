import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState } from 'react-native';
import { databaseManager } from '../data/database';
import { messageRepository } from '../data/messageRepository';
import { networkManager } from '../services/networkManager';
import { syncService } from '../services/syncService';
import { Message, User } from '../types';
import { API_URL } from '../utils/api';
import { createOfflineMessage, generateTempId } from '../utils/messageUtils';
import { socket } from '../utils/socket';

export const useOfflineChat = (username: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const listenersSetupRef = useRef(false);
  const socketConnectedRef = useRef(false);
  const lastFetchRef = useRef<Date | null>(null);
  const appStateRef = useRef(AppState.currentState);

  
  const handleNewMessage = useCallback(
    async (msg: Message) => {
      const messageId = msg._id;
      console.log('📥 Nova mensagem recebida:', messageId);

      const existingMessage = await messageRepository.getMessageById(messageId);
      if (existingMessage) {
        console.log('⚠️ Mensagem já existe no banco:', messageId);
        return;
      }

      
      const processed: Message = {
        ...msg,
        isOwn: msg.username === username,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || {},
        isPending: false,
        isSynced: true,
      };

      await messageRepository.saveMessage(processed, false);
      setMessages((prev) => {
        if (prev.some((m) => m._id === messageId)) return prev;
        return [...prev, processed];
      });
    },
    [username]
  );

  
  const handleMessageUpdated = useCallback(
    async (updated: Message) => {
      console.log('✏️ Mensagem atualizada:', updated._id);
      const processed = {
        ...updated,
        isOwn: updated.username === username,
        timestamp: new Date(updated.timestamp),
        reactions: updated.reactions || {},
      };

      try {
        await messageRepository.updateMessage(updated._id, {
          reactions: processed.reactions,
        });

      
        const allMessages = await messageRepository.getAllMessages();
        const withIsOwn = allMessages.map((m) => ({
          ...m,
          isOwn: m.username === username,
          timestamp: new Date(m.timestamp),
          reactions: m.reactions || {},
        }));
        setMessages(withIsOwn);
      } catch (error) {
        console.error('❌ Erro ao atualizar mensagem:', error);
      }
    },
    [username]
  );

  const handleOnlineUsers = useCallback((users: string[]) => {
    console.log('👥 Usuários online:', users.length);
    setOnlineUsers(users.map((u) => ({ username: u, online: true })));
  }, []);

  const handleConnect = useCallback(async () => {
    console.log('✅ WebSocket conectado');
    socketConnectedRef.current = true;
    if (username) {
      socket.emit('joinChat', username);
      await fetchMissedMessages();
    }
  }, [username]);

  const handleConnectError = useCallback((err: any) => {
    console.error('❌ Erro no WebSocket:', err.message);
    socketConnectedRef.current = false;
  }, []);

  const fetchMissedMessages = useCallback(async () => {
    if (!networkManager.isOnline() || !username) return;

    try {
      console.log('🔍 Buscando mensagens perdidas...');
      const localMessages = await messageRepository.getAllMessages();
      const lastMessage = localMessages[localMessages.length - 1];

      let since: string | undefined;
      if (lastMessage) {
        since = lastMessage.timestamp.toISOString();
      } else if (lastFetchRef.current) {
        since = lastFetchRef.current.toISOString();
      }

      const token = await AsyncStorage.getItem('token');
      let url = `${API_URL}/api/messages`;
      if (since) {
        url += `?since=${since}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      
      const serverMessages: Message[] = response.data.map((msg: any) => ({
        ...msg,
        isOwn: msg.username === username,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || {},
        isSynced: true,
        isPending: false,
        tempId: null,
      }));

      console.log('📨 Mensagens do servidor:', serverMessages.length);

      let hasUpdates = false;
      for (const serverMsg of serverMessages) {
        const exists = await messageRepository.getMessageById(serverMsg._id);
        if (!exists) {
          await messageRepository.saveMessage(serverMsg, false);
          hasUpdates = true;
        } else if (JSON.stringify(exists.reactions) !== JSON.stringify(serverMsg.reactions)) {
          await messageRepository.updateMessage(serverMsg._id, { reactions: serverMsg.reactions });
          hasUpdates = true;
        }
      }

      if (hasUpdates || serverMessages.length > 0) {
        const allMessages = await messageRepository.getAllMessages();
        const withIsOwn = allMessages.map((m) => ({
          ...m,
          isOwn: m.username === username,
          timestamp: new Date(m.timestamp),
          reactions: m.reactions || {},
        }));
        setMessages(withIsOwn);
      }

      lastFetchRef.current = new Date();
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens perdidas:', error);
    }
  }, [username]);

  const handleAppStateChange = useCallback(
    async (nextAppState: string) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App voltou ao foreground - sincronizando...');
        if (isInitialized && networkManager.isOnline()) {
          await fetchMissedMessages();
          const pendingMessages = await messageRepository.getPendingMessages();
          if (pendingMessages.length > 0) {
            await handleSync();
          }
        }
      }
      appStateRef.current = nextAppState;
    },
    [isInitialized, fetchMissedMessages]
  );

  
  useEffect(() => {
    const initDatabase = async () => {
      if (!isInitialized) {
        try {
          console.log('💾 Inicializando banco de dados...');
          await databaseManager.init();
          const localMessages = await messageRepository.getAllMessages();

          // ✅ Recalcula isOwn aqui também
          const processedMessages = localMessages.map((msg) => ({
            ...msg,
            isOwn: msg.username === username,
            timestamp: new Date(msg.timestamp),
            reactions: msg.reactions || {},
          }));

          console.log('📖 Mensagens carregadas do banco:', processedMessages.length);
          setMessages(processedMessages);
          setIsInitialized(true);
        } catch (error) {
          console.error('❌ Erro ao inicializar banco:', error);
          Alert.alert('Erro', 'Falha ao inicializar banco de dados');
        }
      }
    };

    initDatabase();
  }, [isInitialized, username]); 

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [handleAppStateChange]);

  useEffect(() => {
    if (!isInitialized) return;

    const handleNetworkChange = async (online: boolean) => {
      console.log('🌐 Status da rede mudou:', online ? 'ONLINE' : 'OFFLINE');
      if (online) {
        if (!socketConnectedRef.current) {
          socket.connect();
        }
        await fetchMissedMessages();
        const pendingMessages = await messageRepository.getPendingMessages();
        if (pendingMessages.length > 0 && !isSyncing) {
          await handleSync();
        }
      }
    };

    const unsubscribe = networkManager.onNetworkChange(handleNetworkChange);
    return () => unsubscribe();
  }, [isInitialized, isSyncing, fetchMissedMessages]);

  useEffect(() => {
    if (!username || !isInitialized) return;

    if (!listenersSetupRef.current) {
      console.log('🔧 Configurando WebSocket listeners...');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('newMessage');
      socket.off('messageUpdated');
      socket.off('onlineUsers');

      socket.on('connect', handleConnect);
      socket.on('connect_error', handleConnectError);
      socket.on('newMessage', handleNewMessage);
      socket.on('messageUpdated', handleMessageUpdated);
      socket.on('onlineUsers', handleOnlineUsers);

      listenersSetupRef.current = true;
    }

    if (!socket.connected && !socketConnectedRef.current) {
      socket.connect();
    } else if (socket.connected && username) {
      socket.emit('joinChat', username);
      socketConnectedRef.current = true;
      fetchMissedMessages();
    }

    return () => {
      console.log('🧹 Cleanup do useOfflineChat');
    };
  }, [username, isInitialized, handleConnect, handleConnectError, handleNewMessage, handleMessageUpdated, handleOnlineUsers, fetchMissedMessages]);

  useEffect(() => {
    if (!isInitialized || !username) return;

    const interval = setInterval(async () => {
      if (networkManager.isOnline() && !isSyncing) {
        console.log('⏰ Sincronização periódica...');
        await fetchMissedMessages();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isInitialized, username, isSyncing, fetchMissedMessages]);

  useEffect(() => {
    return () => {
      console.log('🧹 Cleanup final do WebSocket');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('newMessage');
      socket.off('messageUpdated');
      socket.off('onlineUsers');
      listenersSetupRef.current = false;
      socketConnectedRef.current = false;
    };
  }, []);


  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || !username) return;

    const text = inputText.trim();
    const tempId = generateTempId();

    const offlineMsg = createOfflineMessage(
      text,
      username,
      'text',
      undefined,
      undefined,
      replyingTo?._id
    );

   
    const messageWithId = {
      ...offlineMsg,
      _id: tempId,
      isOwn: true,
      isPending: networkManager.isOnline() ? false : true,
    };

    setMessages((prev) => [...prev, messageWithId]);
    setInputText('');
    setReplyingTo(null);

    try {
      if (networkManager.isOnline()) {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/api/messages`,
          {
            text,
            type: 'text',
            replyTo: replyingTo?._id || null,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const serverMsg: Message = {
          ...response.data,
          isOwn: true,
          timestamp: new Date(response.data.timestamp),
          reactions: response.data.reactions || {},
          isPending: false,
          isSynced: true,
        };

        await messageRepository.updateMessageWithNewId(tempId, serverMsg);
        const allMessages = await messageRepository.getAllMessages();
        const withIsOwn = allMessages.map((m) => ({
          ...m,
          isOwn: m.username === username,
          timestamp: new Date(m.timestamp),
          reactions: m.reactions || {},
        }));
        setMessages(withIsOwn);
      } else {
        await messageRepository.saveMessage(messageWithId, true);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      await messageRepository.saveMessage(messageWithId, true);
    }
  }, [inputText, username, replyingTo]);

  
  const sendVoiceMessage = useCallback(
    async (audioUri: string, audioDuration: number, messageText = '[Mensagem de voz]') => {
      if (!username) return;

      const tempId = generateTempId();

      const offlineMsg = createOfflineMessage(
        messageText,
        username,
        'voice',
        audioUri,
        audioDuration,
        replyingTo?._id
      );

      const messageWithId = {
        ...offlineMsg,
        _id: tempId,
        isOwn: true,
        isPending: networkManager.isOnline() ? false : true,
      };

      setMessages((prev) => [...prev, messageWithId]);
      setReplyingTo(null);

      try {
        if (networkManager.isOnline()) {
          const token = await AsyncStorage.getItem('token');
          const formData = new FormData();
          formData.append('audio', {
            uri: audioUri,
            type: 'audio/m4a',
            name: `recording-${tempId}.m4a`,
          } as any);
          formData.append('text', messageText);
          formData.append('type', 'voice');
          formData.append('audioDuration', String(audioDuration));
          if (replyingTo) {
            formData.append('replyTo', replyingTo._id);
          }

          const response = await axios.post(`${API_URL}/api/messages`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });

          const serverMsg: Message = {
            ...response.data,
            isOwn: true,
            timestamp: new Date(response.data.timestamp),
            reactions: response.data.reactions || {},
            isPending: false,
            isSynced: true,
          };

          await messageRepository.updateMessageWithNewId(tempId, serverMsg);
          const allMessages = await messageRepository.getAllMessages();
          const withIsOwn = allMessages.map((m) => ({
            ...m,
            isOwn: m.username === username,
            timestamp: new Date(m.timestamp),
            reactions: m.reactions || {},
          }));
          setMessages(withIsOwn);
        } else {
          await messageRepository.saveMessage(messageWithId, true);
        }
      } catch (error) {
        console.error('❌ Erro ao enviar áudio:', error);
        await messageRepository.saveMessage(messageWithId, true);
      }
    },
    [username, replyingTo]
  );

  
  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const message = await messageRepository.getMessageById(messageId);
        if (!message) return;

        const reactions = { ...message.reactions };
        const users = reactions[emoji] || [];
        const userIndex = users.indexOf(username);

        if (userIndex === -1) {
          reactions[emoji] = [...users, username];
        } else {
          const newUsers = users.filter((u) => u !== username);
          if (newUsers.length === 0) {
            delete reactions[emoji];
          } else {
            reactions[emoji] = newUsers;
          }
        }

        await messageRepository.updateMessage(messageId, { reactions });

        if (networkManager.isOnline()) {
          const token = await AsyncStorage.getItem('token');
          await axios.post(
            `${API_URL}/api/messages/reaction`,
            { messageId, emoji, username },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          await syncService.addReactionOffline(messageId, emoji, username);
        }

        // ✅ Recarrega com isOwn recalculado
        const updatedMessages = await messageRepository.getAllMessages();
        const withIsOwn = updatedMessages.map((m) => ({
          ...m,
          isOwn: m.username === username,
          timestamp: new Date(m.timestamp),
          reactions: m.reactions || {},
        }));
        setMessages(withIsOwn);
      } catch (error) {
        console.error('❌ Erro ao adicionar reação:', error);
        const fallbackMessages = await messageRepository.getAllMessages();
        const withIsOwn = fallbackMessages.map((m) => ({
          ...m,
          isOwn: m.username === username,
          timestamp: new Date(m.timestamp),
          reactions: m.reactions || {},
        }));
        setMessages(withIsOwn);
      }
    },
    [username]
  );

  // ✅ Sincronização
  const handleSync = useCallback(async () => {
    if (!networkManager.isOnline()) {
      Alert.alert('Offline', 'Conecte-se à internet para sincronizar');
      return;
    }

    if (isSyncing) return;

    setIsSyncing(true);
    try {
      console.log('🔄 Iniciando sincronização forçada...');
      await fetchMissedMessages();
      await syncService.syncWithServer(username);
      const allMessages = await messageRepository.getAllMessages();
      const withIsOwn = allMessages.map((m) => ({
        ...m,
        isOwn: m.username === username,
        timestamp: new Date(m.timestamp),
        reactions: m.reactions || {},
      }));
      setMessages(withIsOwn);
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      Alert.alert('Erro', 'Falha na sincronização');
    } finally {
      setIsSyncing(false);
    }
  }, [username, isSyncing, fetchMissedMessages]);

  const refreshMessages = useCallback(async () => {
    if (!networkManager.isOnline()) return;
    await fetchMissedMessages();
  }, [fetchMissedMessages]);

 
  useEffect(() => {
    if (isInitialized) {
      console.log(' DEBUG OFFLINE-First:', {
        isInitialized,
        isOnline: networkManager.isOnline(),
        socketConnected: socketConnectedRef.current,
        listenersSetup: listenersSetupRef.current,
        totalMessages: messages.length,
        pending: messages.filter((m) => m.isPending).length,
        isSyncing,
        username,
      });
    }
  }, [isInitialized, messages.length, isSyncing, username]);

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
