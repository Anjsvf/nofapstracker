import AsyncStorage from '@react-native-async-storage/async-storage';
import { messageRepository } from '../data/messageRepository';
import { syncRepository } from '../data/syncRepository';
import { Message } from '../types';
import { API_URL } from '../utils/api';
import { networkManager } from './networkManager';

export class SyncService {
  private syncInProgress = false;
  private syncCallbacks: ((messages: Message[]) => void)[] = [];
  private syncTimeout: NodeJS.Timeout | null = null;

  async syncWithServer(username: string): Promise<void> {
    if (this.syncInProgress || !networkManager.isOnline()) return;

    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    await new Promise(resolve => { this.syncTimeout = setTimeout(resolve, 500); });
    this.syncInProgress = true;
    const token = await AsyncStorage.getItem('token');

    try {
      console.log('[SyncService] 🔄 Iniciando sincronização...');
      await this.fetchNewMessagesFromServer(username, token);
      await this.syncPendingMessagesToServer(token);
      await this.processSyncQueue(token);
      const allMessages = await messageRepository.getAllMessages();
      this.notifyListeners(allMessages);
    } catch (error) {
      console.error('[SyncService] ❌ Erro geral na sync:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  async fetchMissedMessages(username: string, since?: Date): Promise<Message[]> {
    if (!networkManager.isOnline()) return [];

    try {
      console.log('[SyncService] 🔍 Buscando mensagens perdidas...');
      const token = await AsyncStorage.getItem('token');
      let url = `${API_URL}/api/messages`;
      if (since) url += `?since=${since.toISOString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      const serverMessages: Message[] = data.map((msg: any) => ({
        ...msg,
        isOwn: msg.username === username,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || {},
        isSynced: true,
        isPending: false,
        tempId: undefined, 
      }));

      let hasUpdates = false;
      for (const msg of serverMessages) {
        const exists = await messageRepository.getMessageById(msg._id);
        if (!exists) {
          await messageRepository.saveMessage(msg, false);
          hasUpdates = true;
        } else if (JSON.stringify(exists.reactions) !== JSON.stringify(msg.reactions)) {
          await messageRepository.updateMessage(msg._id, { reactions: msg.reactions });
          hasUpdates = true;
        }
      }

      if (hasUpdates) {
        const allMessages = await messageRepository.getAllMessages();
        this.notifyListeners(allMessages);
      }

      return serverMessages;
    } catch (error) {
      console.error('[SyncService] ❌ Erro ao buscar mensagens:', error);
      return [];
    }
  }

  private async syncPendingMessagesToServer(token: string | null): Promise<void> {
    const pendingMessages = await messageRepository.getPendingMessages();
    for (const message of pendingMessages) {
      try {
        const serverResponse = await this.syncMessage(message, token);
        const updatedMessage: Message = {
          _id: serverResponse._id,
          username: serverResponse.username || message.username,
          text: serverResponse.text || message.text,
          type: serverResponse.type || message.type,
          audioUri: serverResponse.audioUri || message.audioUri,
          audioDuration: serverResponse.audioDuration || message.audioDuration,
          timestamp: new Date(serverResponse.timestamp),
          replyTo: serverResponse.replyTo || message.replyTo,
          reactions: serverResponse.reactions || message.reactions,
          isOwn: serverResponse.username === message.username,
          isSynced: true,
          isPending: false,
          tempId: undefined, 
        };
        await messageRepository.updateMessageWithNewId(message._id, updatedMessage);
      } catch (error) {
        console.error(`[SyncService] ❌ Falha ao sincronizar mensagem ${message._id}:`, error);
      }
    }
  }

  private async syncMessage(message: Message, token: string | null): Promise<any> {
    if (message.type === 'voice' && message.audioUri) {
      const formData = new FormData();
      formData.append('audio', {
        uri: message.audioUri,
        type: 'audio/m4a',
        name: `recording-${Date.now()}.m4a`,
      } as any);
      formData.append('text', message.text);
      formData.append('type', 'voice');
      formData.append('audioDuration', message.audioDuration?.toString() || '0');
      
     
      if (message.replyTo) {
        const replyToId = typeof message.replyTo === 'string' 
          ? message.replyTo 
          : message.replyTo._id;
        formData.append('replyTo', replyToId);
      }

      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Falha no áudio`);
      }

      return await res.json();
    } else {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.text,
          type: message.type,
          
          replyTo: message.replyTo ? (typeof message.replyTo === 'string' ? message.replyTo : message.replyTo._id) : null,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Falha no texto`);
      }

      return await res.json();
    }
  }

  private async fetchNewMessagesFromServer(username: string, token: string | null): Promise<void> {
    try {
      const lastSync = await messageRepository.getLastSyncTimestamp();
      let url = `${API_URL}/api/messages`;
      if (lastSync) url += `?since=${lastSync.toISOString()}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Falha no fetch`);
      }

      const data = await res.json();

      const serverMessages: Message[] = data.map((msg: any) => ({
        ...msg,
        isOwn: msg.username === username,
        timestamp: new Date(msg.timestamp),
        reactions: msg.reactions || {},
        isSynced: true,
        isPending: false,
        tempId: undefined, 
      }));

      for (const msg of serverMessages) {
        const exists = await messageRepository.getMessageById(msg._id);
        if (!exists) {
          await messageRepository.saveMessage(msg, false);
        } else if (JSON.stringify(exists.reactions) !== JSON.stringify(msg.reactions)) {
          await messageRepository.updateMessage(msg._id, { reactions: msg.reactions });
        }
      }

      await messageRepository.updateLastSyncTimestamp(new Date());
    } catch (error) {
      console.error('[SyncService] ❌ Erro ao buscar mensagens do servidor:', error);
    }
  }

  private async processSyncQueue(token: string | null): Promise<void> {
  
    const syncQueue = await syncRepository.getSyncQueue();
    for (const item of syncQueue) {
      try {
        if (item.action === 'REACTION') {
          await this.syncReaction(item, token);
        }
        await syncRepository.removeSyncQueueItem(item.id);
      } catch (error) {
        console.error(`[SyncService] ❌ Falha no item da fila ${item.id}:`, error);
        await syncRepository.incrementSyncAttempts(item.id);
      }
    }
  }

  private async syncReaction(item: any, token: string | null): Promise<void> {
    const data = JSON.parse(item.data);
    const response = await fetch(`${API_URL}/api/messages/reaction`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Falha na reação`);
    }
  }

  async addReactionOffline(messageId: string, emoji: string, username: string): Promise<void> {
    const message = await messageRepository.getMessageById(messageId);
    if (!message) return;

    const reactions = { ...message.reactions };
    const current = reactions[emoji] || [];
    const idx = current.indexOf(username);

    if (idx === -1) {
      reactions[emoji] = [...current, username];
    } else {
      const newUsers = current.filter(u => u !== username);
      if (newUsers.length === 0) {
        delete reactions[emoji];
      } else {
        reactions[emoji] = newUsers;
      }
    }

    await messageRepository.updateMessage(messageId, { reactions });
    await syncRepository.addToSyncQueue(messageId, 'REACTION', { messageId, emoji, username });
  }

  onSyncComplete(callback: (messages: Message[]) => void): void {
    this.syncCallbacks.push(callback);
  }

  removeListener(callback: (messages: Message[]) => void): void {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  private notifyListeners(messages: Message[]): void {
    this.syncCallbacks.forEach(cb => cb(messages));
  }

  isSyncing(): boolean {
    return this.syncInProgress;
  }

  cancelSync(): void {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
    this.syncInProgress = false;
  }
}

export const syncService = new SyncService();