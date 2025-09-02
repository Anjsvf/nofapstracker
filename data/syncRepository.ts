import { SyncQueueItem } from '../types';
import { databaseManager } from './database';



export class SyncRepository {
  async addToSyncQueue(messageId: string, action: string, data: any): Promise<void> {
    const db = await databaseManager.getDatabase();

    const query = `
      INSERT INTO sync_queue (messageId, action, data)
      VALUES (?, ?, ?)
    `;

    await db.runAsync(query, [messageId, action, JSON.stringify(data)]);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const db = await databaseManager.getDatabase();

    const query = `
      SELECT * FROM sync_queue 
      WHERE attempts < maxAttempts 
      ORDER BY createdAt ASC
    `;

    const result = await db.getAllAsync(query);
    return result as SyncQueueItem[];
  }

  async incrementSyncAttempts(id: number): Promise<void> {
    const db = await databaseManager.getDatabase();

    const query = `UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`;
    await db.runAsync(query, [id]);
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    const db = await databaseManager.getDatabase();

    const query = `DELETE FROM sync_queue WHERE id = ?`;
    await db.runAsync(query, [id]);
  }

  async clearSyncQueue(): Promise<void> {
    const db = await databaseManager.getDatabase();

    const query = `DELETE FROM sync_queue`;
    await db.runAsync(query);
  }
}

export const syncRepository = new SyncRepository();