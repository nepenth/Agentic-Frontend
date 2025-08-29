import type { LogEntry } from '../types';

interface WebSocketMessage {
  type: string;
  data: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private currentEndpoint: string = 'logs';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.url = import.meta.env.VITE_WS_URL || 'wss://whyland-ai.nakedsun.xyz/ws';
  }

  connect(endpoint: string = 'logs', token?: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return this.socket;
    }

    // Store current endpoint for reconnection
    this.currentEndpoint = endpoint;

    // Build URL with specific endpoint and token if provided
    const baseUrl = this.url.replace('/ws', ''); // Remove trailing /ws if present
    const wsUrl = token ? `${baseUrl}/ws/${endpoint}?token=${token}` : `${baseUrl}/ws/${endpoint}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.attemptReconnect(token);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket connection error:', error);
    };

    this.socket.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    return this.socket;
  }

  private attemptReconnect(token?: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

      setTimeout(() => {
        this.connect(this.currentEndpoint, token);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error(`Error in message handler for ${message.type}:`, error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.messageHandlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
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
    // Connect to logs endpoint with filters as query parameters
    const queryParams = new URLSearchParams();
    if (filters?.agent_id) queryParams.append('agent_id', filters.agent_id);
    if (filters?.task_id) queryParams.append('task_id', filters.task_id);
    if (filters?.level) queryParams.append('level', filters.level);

    const endpoint = `logs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    // Connect to the logs endpoint
    this.connect(endpoint);

    // Add handler for log_entry messages
    this.addMessageHandler('log_entry', callback);

    return () => {
      this.removeMessageHandler('log_entry', callback);
    };
  }

  // Subscribe to task updates
  subscribeToTaskUpdates(
    taskId: string,
    callback: (update: any) => void
  ) {
    // Connect to task-specific endpoint
    const endpoint = `tasks/${taskId}`;
    this.connect(endpoint);

    // Add handler for task messages
    this.addMessageHandler('task_status', callback);
    this.addMessageHandler('task_progress', callback);
    this.addMessageHandler('task_complete', callback);

    return () => {
      this.removeMessageHandler('task_status', callback);
      this.removeMessageHandler('task_progress', callback);
      this.removeMessageHandler('task_complete', callback);
    };
  }

  // Subscribe to general notifications
  subscribeToNotifications(callback: (notification: any) => void) {
    this.addMessageHandler('notification', callback);

    return () => {
      this.removeMessageHandler('notification', callback);
    };
  }

  private addMessageHandler(type: string, callback: (data: any) => void) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(callback);
  }

  private removeMessageHandler(type: string, callback: (data: any) => void) {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.messageHandlers.delete(type);
      }
    }
  }

  // Send custom messages
  send(type: string, data: any) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected. Call connect() first.');
    }

    const message = {
      type,
      data
    };
    this.socket.send(JSON.stringify(message));
  }

  // Listen to custom message types
  on(type: string, callback: (data: any) => void) {
    this.addMessageHandler(type, callback);
  }

  // Remove message listener
  off(type: string, callback: (data: any) => void) {
    this.removeMessageHandler(type, callback);
  }
}

export const webSocketService = new WebSocketService();
export default webSocketService;