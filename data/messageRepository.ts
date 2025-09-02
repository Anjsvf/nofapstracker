import { Message } from '../types';
import { databaseManager } from './database';

export class MessageRepository {
  async saveMessage(message: Message, isPending: boolean = false): Promise<void> {
    const db = await databaseManager.getDatabase();

    const query = `
      INSERT OR REPLACE INTO messages 
      (_id, username, text, type, audioUri, audioDuration, timestamp, replyTo, reactions, isOwn, isSynced, isPending, tempId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const replyToId = typeof message.replyTo === 'object' && message.replyTo !== null
      ? message.replyTo._id
      : message.replyTo;

    await db.runAsync(query, [
      message._id,
      message.username,
      message.text,
      message.type || 'text',
      message.audioUri || null,
      message.audioDuration || null,
      message.timestamp.toISOString(),
      replyToId || null,
      JSON.stringify(message.reactions || {}),
      message.isOwn ? 1 : 0,
      isPending ? 0 : 1,
      isPending ? 1 : 0,
      message.tempId || null
    ]);
  }

  async getAllMessages(): Promise<Message[]> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM messages ORDER BY timestamp ASC`;
    const result = await db.getAllAsync(query);
    return result.map(row => this.mapRowToMessage(row as any));
  }

  async getPendingMessages(): Promise<Message[]> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM messages WHERE isPending = 1 ORDER BY timestamp ASC`;
    const result = await db.getAllAsync(query);
    return result.map(row => this.mapRowToMessage(row as any));
  }

  async getMessageById(messageId: string): Promise<Message | null> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM messages WHERE _id = ? OR tempId = ?`;
    const result = await db.getFirstAsync(query, [messageId, messageId]) as any;
    return result ? this.mapRowToMessage(result) : null;
  }

  async getMessagesByDateRange(from: Date, to: Date): Promise<Message[]> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT * FROM messages WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC`;
    const result = await db.getAllAsync(query, [from.toISOString(), to.toISOString()]);
    return result.map(row => this.mapRowToMessage(row as any));
  }

  async updateMessage(messageId: string, updates: Partial<Message>): Promise<void> {
    const db = await databaseManager.getDatabase();
    const fields = Object.keys(updates).filter(key => key !== '_id');
    if (fields.length === 0) return;

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => {
      const value = (updates as any)[field];
      if (field === 'reactions') return JSON.stringify(value);
      if (field === 'timestamp') return value?.toISOString();
      if (typeof value === 'boolean') return value ? 1 : 0;
      return value;
    });

    const query = `UPDATE messages SET ${setClause} WHERE _id = ?`;
    await db.runAsync(query, [...values, messageId]);
  }

  async updateMessageWithNewId(oldId: string, newMessage: Message): Promise<void> {
    const db = await databaseManager.getDatabase();

    const replyToId = typeof newMessage.replyTo === 'object' && newMessage.replyTo !== null
      ? newMessage.replyTo._id
      : newMessage.replyTo;

    const query = `
      UPDATE messages 
      SET 
        _id = ?,
        username = ?,
        text = ?,
        type = ?,
        audioUri = ?,
        audioDuration = ?,
        timestamp = ?,
        replyTo = ?,
        reactions = ?,
        isOwn = ?,
        isSynced = 1,
        isPending = 0,
        tempId = NULL
      WHERE _id = ? OR tempId = ?
    `;

    await db.runAsync(query, [
      newMessage._id,
      newMessage.username,
      newMessage.text,
      newMessage.type || 'text',
      newMessage.audioUri || null,
      newMessage.audioDuration || null,
      newMessage.timestamp.toISOString(),
      replyToId || null,
      JSON.stringify(newMessage.reactions || {}),
      newMessage.isOwn ? 1 : 0,
      oldId,
      oldId
    ]);
  }

  async markMessageAsSynced(messageId: string): Promise<void> {
    const db = await databaseManager.getDatabase();
    const query = `UPDATE messages SET isSynced = 1, isPending = 0 WHERE _id = ? OR tempId = ?`;
    await db.runAsync(query, [messageId, messageId]);
  }

  async deleteMessage(messageId: string): Promise<void> {
    const db = await databaseManager.getDatabase();
    const query = `DELETE FROM messages WHERE _id = ? OR tempId = ?`;
    await db.runAsync(query, [messageId, messageId]);
  }

  async getLastSyncTimestamp(): Promise<Date | null> {
    const db = await databaseManager.getDatabase();
    const query = `SELECT lastSyncTimestamp FROM last_sync WHERE id = 1`;
    const result = await db.getFirstAsync(query) as any;
    return result ? new Date(result.lastSyncTimestamp) : null;
  }

  async updateLastSyncTimestamp(timestamp: Date): Promise<void> {
    const db = await databaseManager.getDatabase();
    const query = `
      INSERT OR REPLACE INTO last_sync (id, lastSyncTimestamp, updatedAt)
      VALUES (1, ?, CURRENT_TIMESTAMP)
    `;
    await db.runAsync(query, [timestamp.toISOString()]);
  }

  private mapRowToMessage(row: any): Message {
    return {
      _id: row._id,
      username: row.username,
      text: row.text,
      type: row.type,
      audioUri: row.audioUri,
      audioDuration: row.audioDuration,
      timestamp: new Date(row.timestamp),
      replyTo: row.replyTo,
      reactions: row.reactions ? JSON.parse(row.reactions) : {},
      isOwn: Boolean(row.isOwn),
      tempId: row.tempId,
      isPending: Boolean(row.isPending),
      isSynced: Boolean(row.isSynced)
    };
  }
}

export const messageRepository = new MessageRepository();