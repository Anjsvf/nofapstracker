
import io from 'socket.io-client';
import { API_URL } from './api';

export const socket = io(API_URL, {
  transports: ['websocket', 'polling'],
  timeout: 20000,
  forceNew: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  autoConnect: false, 
});


export const connectWithBadge = (username: string, badge: any | null, currentStreak: number) => {
  if (!socket.connected) {
    socket.connect();
  }
  
  socket.emit('joinChat', {
    username,
    badge,
    currentStreak,
  });
  
  console.log('🔌 Conectando ao chat com badge:', badge?.name || 'Nenhuma');
};


export const updateSocketBadge = (badge: any | null, currentStreak: number) => {
  if (socket.connected) {
    socket.emit('updateBadge', {
      badge,
      currentStreak,
    });
    console.log('Badge atualizada via socket:', badge?.name || 'Nenhuma');
  }
};