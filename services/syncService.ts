// services/syncService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { messageRepository } from '../data/messageRepository';
import { syncRepository } from '../data/syncRepository';
import { Message } from '../types';
import { API_URL } from '../utils/api';
import { networkManager } from './networkManager';

export class SyncService {
  private isSyncing = false;

  async syncWithServer(username: string): Promise<void> {
    if (this.isSyncing || !networkManager.isOnline()) return;

    this.isSyncing = true;
    const token = await AsyncStorage.getItem('token');

    try {
      console.log('[SyncService] Iniciando sincronização completa...');

      // 1. Busca mensagens novas do servidor
      await this.fetchNewMessagesFromServer(username, token);

      // 2. Envia mensagens pendentes da fila (CREATE)
      await this.syncPendingCreations(token);

      // 3. Processa reações pendentes (REACTION)
      await this.processReactionQueue(token);

      // 4. Atualiza UI com estado final do banco
      const allMessages = await messageRepository.getAllMessages();
      this.notifyListeners(allMessages);
    } catch (error) {
      console.error('[SyncService] Erro na sincronização geral:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Busca mensagens perdidas do servidor
  private async fetchNewMessagesFromServer(username: string, token: string | null): Promise<void> {
    try {
      const lastSync = await messageRepository.getLastSyncTimestamp();
      let url = `${API_URL}/api/messages`;
      if (lastSync) url += `?since=${lastSync.toISOString()}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const serverMessages: Message[] = data.map((m: any) => ({
        ...m,
        isOwn: m.username === username,
        timestamp: new Date(m.timestamp),
        reactions: m.reactions || {},
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
      console.error('[SyncService] Erro ao buscar mensagens do servidor:', error);
    }
  }

  // Envia apenas mensagens que estão na sync_queue com action = 'CREATE'
  private async syncPendingCreations(token: string | null): Promise<void> {
    const queue = await syncRepository.getSyncQueue();
    const createItems = queue.filter(item => item.action === 'CREATE');

    for (const item of createItems) {
      try {
        const payload = JSON.parse(item.data);

        let body: any;
        let headers: any = { Authorization: `Bearer ${token}` };

        if (payload.type === 'voice' && payload.audioUri) {
          const form = new FormData();
          form.append('audio', {
            uri: payload.audioUri,
            type: 'audio/m4a',
            name: `voice-${item.messageId}.m4a`,
          } as any);
          form.append('text', payload.text);
          form.append('type', 'voice');
          form.append('audioDuration', String(payload.audioDuration || 0));
          if (payload.replyTo) form.append('replyTo', payload.replyTo);
          body = form;
        } else {
          headers['Content-Type'] = 'application/json';
          body = JSON.stringify({
            text: payload.text,
            type: payload.type || 'text',
            replyTo: payload.replyTo || null,
          });
        }

        const res = await fetch(`${API_URL}/api/messages`, {
          method: 'POST',
          headers,
          body,
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`HTTP ${res.status}: ${err}`);
        }

        const serverMsg = await res.json();

        // Substitui tempId pelo _id real
        await messageRepository.updateMessageWithNewId(item.messageId, {
          ...serverMsg,
          isOwn: true,
          timestamp: new Date(serverMsg.timestamp),
          reactions: serverMsg.reactions || {},
        });

        // Remove da fila com sucesso
        await syncRepository.removeSyncQueueItem(item.id);
        console.log(`Mensagem sincronizada: ${item.messageId} → ${serverMsg._id}`);

      } catch (error) {
        console.error(`Falha ao sincronizar ${item.messageId}:`, error);
        await syncRepository.incrementSyncAttempts(item.id);

        // Se esgotou tentativas → remove da fila (evita loop infinito)
        const updatedItem = await syncRepository.getSyncQueue().then(q => q.find(i => i.id === item.id));
        if (updatedItem && updatedItem.attempts >= updatedItem.maxAttempts) {
          await syncRepository.removeSyncQueueItem(item.id);
          console.warn(`Mensagem ${item.messageId} descartada após ${updatedItem.maxAttempts} tentativas`);
        }
      }
    }
  }

  // Processa reações offline
  private async processReactionQueue(token: string | null): Promise<void> {
    const queue = await syncRepository.getSyncQueue();
    const reactionItems = queue.filter(i => i.action === 'REACTION');

    for (const item of reactionItems) {
      try {
        const data = JSON.parse(item.data);
        const res = await fetch(`${API_URL}/api/messages/reaction`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        await syncRepository.removeSyncQueueItem(item.id);
      } catch (error) {
        await syncRepository.incrementSyncAttempts(item.id);
      }
    }
  }

  // Adiciona reação offline (já estava bom, só deixei aqui pra referência)
  async addReactionOffline(messageId: string, emoji: string, username: string): Promise<void> {
    const message = await messageRepository.getMessageById(messageId);
    if (!message) return;

    const reactions = { ...message.reactions };
    const users = reactions[emoji] || [];
    const idx = users.indexOf(username);

    if (idx === -1) {
      reactions[emoji] = [...users, username];
    } else {
      const filtered = users.filter(u => u !== username);
      if (filtered.length === 0) delete reactions[emoji];
      else reactions[emoji] = filtered;
    }

    await messageRepository.updateMessage(messageId, { reactions });
    await syncRepository.addToSyncQueue(messageId, 'REACTION', { messageId, emoji, username });
  }

  // Callbacks para notificar o hook
  private syncCallbacks: ((messages: Message[]) => void)[] = [];

  onSyncComplete(callback: (messages: Message[]) => void) {
    this.syncCallbacks.push(callback);
  }

  private notifyListeners(messages: Message[]) {
    this.syncCallbacks.forEach(cb => cb(messages));
  }
}

export const syncService = new SyncService();