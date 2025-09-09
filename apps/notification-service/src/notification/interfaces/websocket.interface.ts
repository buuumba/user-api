import { Socket } from 'socket.io';

export interface WebSocketClient extends Socket {
  id: string;
}

export interface WebSocketMessage {
  event: string;
  data: any;
}

export interface PingMessage {
  message: string;
  timestamp?: number;
}

export interface PongMessage {
  message: string;
  timestamp: number;
}
