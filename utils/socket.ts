import io from 'socket.io-client';
import { API_URL } from './api';

export const socket = io(API_URL, {
  transports: ['websocket'],
  timeout: 20000,
  forceNew: true,
});