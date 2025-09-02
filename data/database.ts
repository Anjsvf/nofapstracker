import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';

const DB_NAME = 'chat.db';
const TARGET_DB_VERSION = 1;

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      console.log('💾 Abrindo banco de dados:', DB_NAME);
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      await this.migrateDatabase();
      console.log('✅ Database initialized and migrated');
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      Alert.alert('Erro', 'Falha ao inicializar o banco de dados');
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        _id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        text TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'text',
        audioUri TEXT,
        audioDuration INTEGER,
        timestamp TEXT NOT NULL,
        replyTo TEXT,
        reactions TEXT DEFAULT '{}',
        isOwn INTEGER NOT NULL DEFAULT 0,
        isSynced INTEGER NOT NULL DEFAULT 1,
        isPending INTEGER NOT NULL DEFAULT 0,
        tempId TEXT,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createSyncQueueTable = `
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        messageId TEXT NOT NULL,
        action TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        attempts INTEGER NOT NULL DEFAULT 0,
        maxAttempts INTEGER NOT NULL DEFAULT 3
      );
    `;

    const createLastSyncTable = `
      CREATE TABLE IF NOT EXISTS last_sync (
        id INTEGER PRIMARY KEY,
        lastSyncTimestamp TEXT NOT NULL,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;

    try {
      await this.db.execAsync(createMessagesTable);
      await this.db.execAsync(createSyncQueueTable);
      await this.db.execAsync(createLastSyncTable);

     
      await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);');
      await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_messages_pending ON messages(isPending);');
      await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_messages_synced ON messages(isSynced);');
      await this.db.execAsync('CREATE INDEX IF NOT EXISTS idx_sync_queue_attempts ON sync_queue(attempts);');

      console.log('✅ Tables and indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  private async migrateDatabase(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    let currentVersion = 0;
    try {
      const result = await this.db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
      currentVersion = result?.user_version || 0;
      console.log(`Current DB version: ${currentVersion}, Target: ${TARGET_DB_VERSION}`);
    } catch (error) {
      console.error('❌ Failed to get DB version:', error);
    }

    if (currentVersion >= TARGET_DB_VERSION) {
      console.log('✅ Database is up to date');
      return;
    }

  
    if (currentVersion < 1) {
      console.log('🔄 Applying migration to version 1...');

     
      await this.safeAddColumn('messages', 'isPending', 'INTEGER NOT NULL DEFAULT 0');
      await this.safeAddColumn('messages', 'isSynced', 'INTEGER NOT NULL DEFAULT 1');
      await this.safeAddColumn('messages', 'tempId', 'TEXT');
      await this.safeAddColumn('messages', 'reactions', 'TEXT DEFAULT "{}"');

      // Atualizar versão
      await this.db.execAsync(`PRAGMA user_version = ${TARGET_DB_VERSION};`);
      console.log('✅ Migration to version 1 completed');
    }
  }

  private async safeAddColumn(table: string, column: string, definition: string): Promise<void> {
    if (!this.db) return;

    try {
     
      const tableInfo = await this.db.getAllAsync(`PRAGMA table_info(${table});`);
      const columnExists = tableInfo.some((col: any) => col.name === column);

      if (columnExists) {
        console.log(`ℹColumn '${column}' already exists in ${table}`);
        return;
      }

      await this.db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
      console.log(`✅ Column '${column}' added to ${table}`);
    } catch (error: any) {
      if (error.message.includes('duplicate column name')) {
        console.log(` Column '${column}' already exists in ${table}`);
      } else {
        console.error(` Failed to add column '${column}' to ${table}:`, error);
      }
    }
  }

  
  async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  
  async getDB(): Promise<SQLite.SQLiteDatabase> {
    return this.getDatabase();
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('🔒 Database closed');
    }
  }

  
  async resetDatabase(): Promise<void> {
    try {
      await this.close();
      await SQLite.deleteDatabaseAsync(DB_NAME);
      this.db = null;
      console.log('🗑️ Database deleted. Will recreate on next init.');
    } catch (error) {
      console.error('❌ Error resetting database:', error);
      throw error;
    }
  }

  
  async checkIntegrity(): Promise<boolean> {
    if (!this.db) return false;

    try {
      const result = await this.db.getFirstAsync<{ integrity_check: string }>('PRAGMA integrity_check;');
      const isValid = result?.integrity_check === 'ok';
      console.log(' Database integrity:', isValid ? 'OK' : 'CORRUPTED');
      return isValid;
    } catch (error) {
      console.error(' Error checking database integrity:', error);
      return false;
    }
  }

  
  async getStats(): Promise<{
    totalMessages: number;
    pendingMessages: number;
    syncedMessages: number;
    queueItems: number;
  }> {
    if (!this.db) {
      return { totalMessages: 0, pendingMessages: 0, syncedMessages: 0, queueItems: 0 };
    }

    try {
      const totalResult = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM messages;');
      const pendingResult = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM messages WHERE isPending = 1;');
      const syncedResult = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM messages WHERE isSynced = 1;');
      const queueResult = await this.db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM sync_queue;');

      return {
        totalMessages: totalResult?.count || 0,
        pendingMessages: pendingResult?.count || 0,
        syncedMessages: syncedResult?.count || 0,
        queueItems: queueResult?.count || 0,
      };
    } catch (error) {
      console.error(' Error getting database stats:', error);
      return { totalMessages: 0, pendingMessages: 0, syncedMessages: 0, queueItems: 0 };
    }
  }
}

export const databaseManager = new DatabaseManager();