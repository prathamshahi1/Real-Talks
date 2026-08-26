import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Socket.IO client instance
 * autoConnect is enabled, supports reconnection with exponential backoff
 */
export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket', 'polling'], // Fallback mechanism for robust connectivity
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
