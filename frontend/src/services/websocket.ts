import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { LogEntry } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
  }

  connect(token?: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.url, {
      auth: token ? { token } : undefined,
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Subscribe to real-time logs
  subscribeToLogs(
    callback: (logEntry: LogEntry) => void,
    filters?: {
      agent_id?: string;
      task_id?: string;
      level?: string;
    }
  ) {
    if (!this.socket) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    this.socket.emit('subscribe_logs', filters);
    this.socket.on('log', callback);

    return () => {
      this.socket?.off('log', callback);
      this.socket?.emit('unsubscribe_logs');
    };
  }

  // Subscribe to task updates
  subscribeToTaskUpdates(
    taskId: string,
    callback: (update: any) => void
  ) {
    if (!this.socket) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    this.socket.emit('subscribe_task', { task_id: taskId });
    this.socket.on(`task_${taskId}`, callback);

    return () => {
      this.socket?.off(`task_${taskId}`, callback);
      this.socket?.emit('unsubscribe_task', { task_id: taskId });
    };
  }

  // Subscribe to general notifications
  subscribeToNotifications(callback: (notification: any) => void) {
    if (!this.socket) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    this.socket.on('notification', callback);

    return () => {
      this.socket?.off('notification', callback);
    };
  }

  // Emit custom events
  emit(event: string, data: any) {
    if (!this.socket) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }
    this.socket.emit(event, data);
  }

  // Listen to custom events
  on(event: string, callback: (data: any) => void) {
    if (!this.socket) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }
    this.socket.on(event, callback);
  }

  // Remove event listener
  off(event: string, callback?: (data: any) => void) {
    if (!this.socket) {
      return;
    }
    this.socket.off(event, callback);
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;