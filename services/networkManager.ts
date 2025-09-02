import NetInfo from '@react-native-community/netinfo';

export class NetworkManager {
  private online = true;
  private listeners: ((isOnline: boolean) => void)[] = [];
  private netInfoUnsubscribe?: () => void;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    this.online = netInfo.isConnected ?? false;

   
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      const wasOnline = this.online;
      this.online = state.isConnected ?? false;
      if (wasOnline !== this.online) {
        this.notifyListeners(this.online);
      }
    });
  }
  isOnline(): boolean {
    return this.online;
  }

 
  onNetworkChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.push(callback);

    return () => {
      this.removeListener(callback);
    };
  }

  removeListener(callback: (isOnline: boolean) => void): void {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach((callback) => callback(isOnline));
  }

  cleanup() {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
  }
}

export const networkManager = new NetworkManager();