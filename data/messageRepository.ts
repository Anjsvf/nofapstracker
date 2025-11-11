
import { Message } from '../types';
import { databaseManager } from './database';

export class MessageRepository {
 
  async saveMessage(message: Message, isPending: boolean = false): Promise<void> {
    const db = await databaseManager.getDatabase();

    try {
     
      const replyToId = message.replyTo 
        ? (typeof message.replyTo === 'string' ? message.replyTo : message.replyTo._id)
        : null;

      const query = `
        INSERT OR REPLACE INTO messages (
          _id, username, text, type, audioUri, audioDuration,
          timestamp, replyTo, reactions, isOwn, isSynced, isPending, tempId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.runAsync(query, [
        message._id,
        message.username,
        message.text,
        message.type,
        message.audioUri || null,
        message.audioDuration || null,
        message.timestamp.toISOString(),
        replyToId,
        JSON.stringify(message.reactions || {}),
        message.isOwn ? 1 : 0,
        message.isSynced ? 1 : 0,
        isPending ? 1 : 0,
        message.tempId || null,
      ]);

      console.log(`✅ Mensagem salva no DB: ${message._id}`);
    } catch (error) {
      console.error('❌ Erro ao salvar mensagem:', error);
      throw error;
    }
  }

 
  async getAllMessages(): Promise<Message[]> {
    const db = await databaseManager.getDatabase();

    try {
      const query = `
        SELECT * FROM messages 
        ORDER BY timestamp ASC
      `;

      const rows = await db.getAllAsync(query);
      return rows.map(this.mapRowToMessage);
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      return [];
    }
  }

  
  async getMessageById(messageId: string): Promise<Message | null> {
    const db = await databaseManager.getDatabase();

    try {
      const query = `SELECT * FROM messages WHERE _id = ? OR tempId = ?`;
      const row = await db.getFirstAsync(query, [messageId, messageId]);

      if (!row) return null;
      return this.mapRowToMessage(row);
    } catch (error) {
      console.error('❌ Erro ao buscar mensagem por ID:', error);
      return null;
    }
  }

 
  async getPendingMessages(): Promise<Message[]> {
    const db = await databaseManager.getDatabase();

    try {
      const query = `
        SELECT * FROM messages 
        WHERE isPending = 1 
        ORDER BY timestamp ASC
      `;

      const rows = await db.getAllAsync(query);
      return rows.map(this.mapRowToMessage);
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens pendentes:', error);
      return [];
    }
  }

 
  async updateMessage(
    messageId: string,
    updates: Partial<Message>
  ): Promise<void> {
    const db = await databaseManager.getDatabase();

    try {
      const setClauses: string[] = [];
      const values: any[] = [];

      if (updates.text !== undefined) {
        setClauses.push('text = ?');
        values.push(updates.text);
      }

      if (updates.reactions !== undefined) {
        setClauses.push('reactions = ?');
        values.push(JSON.stringify(updates.reactions));
      }

      if (updates.isSynced !== undefined) {
        setClauses.push('isSynced = ?');
        values.push(updates.isSynced ? 1 : 0);
      }

      if (updates.isPending !== undefined) {
        setClauses.push('isPending = ?');
        values.push(updates.isPending ? 1 : 0);
      }

      if (updates.audioUri !== undefined) {
        setClauses.push('audioUri = ?');
        values.push(updates.audioUri);
      }

      if (updates.audioDuration !== undefined) {
        setClauses.push('audioDuration = ?');
        values.push(updates.audioDuration);
      }

      if (setClauses.length === 0) {
        console.warn('⚠️ Nenhum campo para atualizar');
        return;
      }

      values.push(messageId);

      const query = `
        UPDATE messages 
        SET ${setClauses.join(', ')}
        WHERE _id = ? OR tempId = ?
      `;

      values.push(messageId); 

      await db.runAsync(query, values);
      console.log(`✅ Mensagem atualizada: ${messageId}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar mensagem:', error);
      throw error;
    }
  }

 
  async updateMessageWithNewId(
    tempId: string,
    serverMessage: Message
  ): Promise<void> {
    const db = await databaseManager.getDatabase();

    try {
      
      const existing = await this.getMessageById(serverMessage._id);

      if (existing && existing._id === serverMessage._id) {
       
        await this.updateMessage(serverMessage._id, {
          isSynced: true,
          isPending: false,
          reactions: serverMessage.reactions,
        });
        return;
      }

     
      const replyToId = serverMessage.replyTo 
        ? (typeof serverMessage.replyTo === 'string' ? serverMessage.replyTo : serverMessage.replyTo._id)
        : null;

      
      const deleteQuery = `DELETE FROM messages WHERE _id = ? OR tempId = ?`;
      await db.runAsync(deleteQuery, [tempId, tempId]);

      const insertQuery = `
        INSERT INTO messages (
          _id, username, text, type, audioUri, audioDuration,
          timestamp, replyTo, reactions, isOwn, isSynced, isPending, tempId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.runAsync(insertQuery, [
        serverMessage._id,
        serverMessage.username,
        serverMessage.text,
        serverMessage.type,
        serverMessage.audioUri || null,
        serverMessage.audioDuration || null,
        serverMessage.timestamp instanceof Date 
          ? serverMessage.timestamp.toISOString() 
          : new Date(serverMessage.timestamp).toISOString(),
        replyToId,
        JSON.stringify(serverMessage.reactions || {}),
        serverMessage.isOwn ? 1 : 0,
        1, 
        0, 
        null, 
      ]);

      console.log(`✅ Mensagem substituída: ${tempId} → ${serverMessage._id}`);
    } catch (error) {
      console.error('❌ Erro ao substituir mensagem:', error);
      throw error;
    }
  }

  
  async upsertMessagesBatch(messages: Message[]): Promise<void> {
    if (messages.length === 0) return;

    const db = await databaseManager.getDatabase();

    try {
      console.log(`🔄 Iniciando batch upsert de ${messages.length} mensagens...`);

    
      await db.execAsync('BEGIN TRANSACTION;');

      for (const msg of messages) {
        const replyToId = msg.replyTo 
          ? (typeof msg.replyTo === 'string' ? msg.replyTo : msg.replyTo._id)
          : null;

        const query = `
          INSERT OR REPLACE INTO messages (
            _id, username, text, type, audioUri, audioDuration,
            timestamp, replyTo, reactions, isOwn, isSynced, isPending, tempId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.runAsync(query, [
          msg._id,
          msg.username,
          msg.text,
          msg.type,
          msg.audioUri || null,
          msg.audioDuration || null,
          msg.timestamp instanceof Date 
            ? msg.timestamp.toISOString() 
            : new Date(msg.timestamp).toISOString(),
          replyToId,
          JSON.stringify(msg.reactions || {}),
          msg.isOwn ? 1 : 0,
          msg.isSynced ? 1 : 0,
          msg.isPending ? 1 : 0,
          msg.tempId || null,
        ]);
      }

      await db.execAsync('COMMIT;');
      console.log(`✅ Batch upsert concluído: ${messages.length} mensagens`);
    } catch (error) {
      console.error('❌ Erro no batch upsert:', error);
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  }

  
  async deleteOldMessages(cutoffDate: Date): Promise<number> {
    const db = await databaseManager.getDatabase();

    try {
      const query = `DELETE FROM messages WHERE timestamp < ?`;
      const result = await db.runAsync(query, [cutoffDate.toISOString()]);

      console.log(`🗑️ Mensagens antigas deletadas: ${result.changes || 0}`);
      return result.changes || 0;
    } catch (error) {
      console.error('❌ Erro ao deletar mensagens antigas:', error);
      return 0;
    }
  }

  
  async getMessagesSince(since: Date): Promise<Message[]> {
    const db = await databaseManager.getDatabase();

    try {
      const query = `
        SELECT * FROM messages 
        WHERE timestamp >= ?
        ORDER BY timestamp ASC
      `;

      const rows = await db.getAllAsync(query, [since.toISOString()]);
      return rows.map(this.mapRowToMessage);
    } catch (error) {
      console.error('❌ Erro ao buscar mensagens desde:', error);
      return [];
    }
  }


  async getLastSyncTimestamp(): Promise<Date | null> {
    const db = await databaseManager.getDatabase();

    try {
      const query = `SELECT lastSyncTimestamp FROM last_sync WHERE id = 1`;
      const result = await db.getFirstAsync<{ lastSyncTimestamp: string }>(query);

      if (result?.lastSyncTimestamp) {
        return new Date(result.lastSyncTimestamp);
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar último sync:', error);
      return null;
    }
  }

 
  async updateLastSyncTimestamp(timestamp: Date): Promise<void> {
    const db = await databaseManager.getDatabase();

    try {
      const query = `
        INSERT OR REPLACE INTO last_sync (id, lastSyncTimestamp, updatedAt)
        VALUES (1, ?, ?)
      `;

      await db.runAsync(query, [
        timestamp.toISOString(),
        new Date().toISOString(),
      ]);

      console.log(`⏰ Last sync atualizado: ${timestamp.toISOString()}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar last sync:', error);
      throw error;
    }
  }

  
  async clearAllMessages(): Promise<void> {
    const db = await databaseManager.getDatabase();

    try {
      await db.runAsync('DELETE FROM messages');
      console.log('🗑️ Todas as mensagens foram deletadas');
    } catch (error) {
      console.error('❌ Erro ao limpar mensagens:', error);
      throw error;
    }
  }

  
  private mapRowToMessage(row: any): Message {
    let replyTo: string | undefined = undefined;
    
    if (row.replyTo) {
      replyTo = row.replyTo;
    }

    return {
      _id: row._id,
      tempId: row.tempId || undefined,
      username: row.username,
      text: row.text,
      type: row.type as 'text' | 'voice',
      audioUri: row.audioUri || undefined,
      audioDuration: row.audioDuration || undefined,
      timestamp: new Date(row.timestamp),
      replyTo,
      reactions: JSON.parse(row.reactions || '{}'),
      isOwn: row.isOwn === 1,
      isSynced: row.isSynced === 1,
      isPending: row.isPending === 1,
    };
  }

 
  async getStats(): Promise<{
    total: number;
    pending: number;
    synced: number;
    text: number;
    voice: number;
  }> {
    const db = await databaseManager.getDatabase();

    try {
      const totalResult = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages'
      );

      const pendingResult = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages WHERE isPending = 1'
      );

      const syncedResult = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM messages WHERE isSynced = 1'
      );

      const textResult = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM messages WHERE type = 'text'"
      );

      const voiceResult = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM messages WHERE type = 'voice'"
      );

      return {
        total: totalResult?.count || 0,
        pending: pendingResult?.count || 0,
        synced: syncedResult?.count || 0,
        text: textResult?.count || 0,
        voice: voiceResult?.count || 0,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return { total: 0, pending: 0, synced: 0, text: 0, voice: 0 };
    }
  }
}

export const messageRepository = new MessageRepository();