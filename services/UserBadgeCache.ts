
import { BadgeSyncService } from './badgeSyncService';


type BadgeData = {
  key: string;
  name: string;
  days: number;
  category: string;
} | null;


class UserBadgeCache {
  private cache = new Map<string, BadgeData>();
  private fetching = new Set<string>();
  private failedAttempts = new Map<string, number>();
  private readonly MAX_RETRIES = 3;
  private readonly CACHE_TTL = 5 * 60 * 1000; 
  private cacheTimestamps = new Map<string, number>();

 
  async getBadge(username: string): Promise<BadgeData> {
   
    if (this.cache.has(username)) {
      const timestamp = this.cacheTimestamps.get(username) || 0;
      const age = Date.now() - timestamp;
      
      if (age < this.CACHE_TTL) {
        console.log(`💎 Badge de ${username} encontrada no cache (idade: ${Math.round(age / 1000)}s)`);
        return this.cache.get(username)!;
      } else {
        console.log(`⏰ Cache de ${username} expirado, recarregando...`);
        this.cache.delete(username);
        this.cacheTimestamps.delete(username);
      }
    }

    
    if (this.fetching.has(username)) {
      console.log(`⏳ Aguardando busca em andamento para ${username}...`);
      return new Promise(resolve => {
        const check = () => {
          if (this.cache.has(username)) {
            resolve(this.cache.get(username)!);
          } else if (!this.fetching.has(username)) {
           
            resolve(null);
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }

    
    const attempts = this.failedAttempts.get(username) || 0;
    if (attempts >= this.MAX_RETRIES) {
      console.warn(`⚠️ Máximo de tentativas atingido para ${username}, retornando null`);
      this.cache.set(username, null);
      this.cacheTimestamps.set(username, Date.now());
      return null;
    }

    
    this.fetching.add(username);
    console.log(`🔍 Buscando badge de ${username}...`);

    try {
     
      const data = await BadgeSyncService.getUserBadge(username);
      const badge = data?.currentBadge || null;

    
      this.cache.set(username, badge);
      this.cacheTimestamps.set(username, Date.now());
      
     
      this.failedAttempts.delete(username);
      
      console.log(`✅ Badge de ${username} carregada:`, badge?.name || 'Nenhuma');
      return badge;
    } catch (error) {
      console.error(`❌ Erro ao buscar badge de ${username}:`, error);
      
     
      this.failedAttempts.set(username, attempts + 1);
      
      
      this.cache.set(username, null);
      this.cacheTimestamps.set(username, Date.now());
      
      return null;
    } finally {
     
      this.fetching.delete(username);
    }
  }

  
  updateBadge(username: string, badge: BadgeData): void {
    this.cache.set(username, badge);
    this.cacheTimestamps.set(username, Date.now());
    console.log(` Badge de ${username} atualizada no cache:`, badge?.name || 'Nenhuma');
  }

  
  invalidate(username: string): void {
    this.cache.delete(username);
    this.cacheTimestamps.delete(username);
    this.failedAttempts.delete(username);
    console.log(` Badge de ${username} removida do cache`);
  }

  
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.failedAttempts.clear();
    this.fetching.clear();
    console.log(`🧹 Cache de badges limpo (${size} entradas removidas)`);
  }

  
  getStats(): {
    cacheSize: number;
    fetching: number;
    failedAttempts: number;
  } {
    return {
      cacheSize: this.cache.size,
      fetching: this.fetching.size,
      failedAttempts: this.failedAttempts.size,
    };
  }

  
  cleanExpired(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [username, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp > this.CACHE_TTL) {
        this.cache.delete(username);
        this.cacheTimestamps.delete(username);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} badges expiradas removidas do cache`);
    }
  }
}


export const userBadgeCache = new UserBadgeCache();


setInterval(() => {
  userBadgeCache.cleanExpired();
}, 5 * 60 * 1000);