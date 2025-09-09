import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PingMessage, PongMessage } from './interfaces/websocket.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: PingMessage): PongMessage {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${JSON.stringify(data)}`);

    return {
      message: data.message,
      timestamp: Date.now(),
    };
  }

  @SubscribeMessage('notification')
  handleNotification(client: Socket, data: any): void {
    this.logger.log(`Notification received from client id: ${client.id}`);
    this.logger.debug(`Notification data: ${JSON.stringify(data)}`);

    this.server.emit('notification', {
      from: client.id,
      data,
      timestamp: Date.now(),
    });
  }
}
