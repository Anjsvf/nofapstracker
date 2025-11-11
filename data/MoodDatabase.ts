import * as SQLite from 'expo-sqlite';
import { MoodEntry, MoodType } from '../types/moods';
import { getCurrentLocalDate } from '../utils/dateUtils';

const DB_NAME = 'mood_journal.db';

class MoodDatabase {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      console.log('✅ Mood database initialized');
    } catch (error) {
      console.error('❌ Error initializing mood database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS mood_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mood TEXT NOT NULL,
        notes TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS mood_triggers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_id INTEGER NOT NULL,
        trigger TEXT NOT NULL,
        FOREIGN KEY (entry_id) REFERENCES mood_entries(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_mood_date ON mood_entries(date);
      CREATE INDEX IF NOT EXISTS idx_mood_created ON mood_entries(created_at);
      CREATE INDEX IF NOT EXISTS idx_trigger_entry ON mood_triggers(entry_id);
    `);
  }

  async addEntry(mood: MoodType, notes: string, triggers: string[]): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

   
    const date = getCurrentLocalDate();
    const createdAt = new Date().toISOString();

    const result = await this.db.runAsync(
      'INSERT INTO mood_entries (mood, notes, date, created_at) VALUES (?, ?, ?, ?)',
      [mood, notes, date, createdAt]
    );

    const entryId = result.lastInsertRowId;

    // Insert triggers
    for (const trigger of triggers) {
      await this.db.runAsync(
        'INSERT INTO mood_triggers (entry_id, trigger) VALUES (?, ?)',
        [entryId, trigger]
      );
    }

    return entryId;
  }

  async getEntries(startDate?: string, endDate?: string): Promise<MoodEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    let query = 'SELECT * FROM mood_entries WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC';

    const entries = await this.db.getAllAsync(query, params) as any[];

    // Get triggers for each entry
    const enrichedEntries: MoodEntry[] = await Promise.all(
      entries.map(async (entry) => {
        const triggers = await this.db!.getAllAsync(
          'SELECT trigger FROM mood_triggers WHERE entry_id = ?',
          [entry.id]
        ) as any[];

        return {
          id: entry.id,
          mood: entry.mood as MoodType,
          notes: entry.notes,
          triggers: triggers.map(t => t.trigger as string),
          date: entry.date,
          createdAt: entry.created_at,
        };
      })
    );

    return enrichedEntries;
  }

  async deleteEntry(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM mood_triggers WHERE entry_id = ?', [id]);
    await this.db.runAsync('DELETE FROM mood_entries WHERE id = ?', [id]);
  }

  async getEntriesByMood(moods: MoodType[]): Promise<MoodEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    const placeholders = moods.map(() => '?').join(',');
    const entries = await this.db.getAllAsync(
      `SELECT * FROM mood_entries WHERE mood IN (${placeholders}) ORDER BY created_at DESC`,
      moods
    ) as any[];

    const enrichedEntries: MoodEntry[] = await Promise.all(
      entries.map(async (entry) => {
        const triggers = await this.db!.getAllAsync(
          'SELECT trigger FROM mood_triggers WHERE entry_id = ?',
          [entry.id]
        ) as any[];

        return {
          id: entry.id,
          mood: entry.mood as MoodType,
          notes: entry.notes,
          triggers: triggers.map(t => t.trigger as string),
          date: entry.date,
          createdAt: entry.created_at,
        };
      })
    );

    return enrichedEntries;
  }

  async getTriggerFrequency(): Promise<Record<string, number>> {
    if (!this.db) throw new Error('Database not initialized');

    const results = await this.db.getAllAsync(
      'SELECT trigger, COUNT(*) as count FROM mood_triggers GROUP BY trigger'
    ) as any[];

    const frequency: Record<string, number> = {};
    results.forEach(row => {
      frequency[row.trigger] = row.count;
    });

    return frequency;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const moodDatabase = new MoodDatabase();