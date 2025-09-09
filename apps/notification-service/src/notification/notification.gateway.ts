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
import { LoggingUtils } from '@app/common';

@WebSocketGateway()
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    LoggingUtils.logOperation(
      this.logger,
      'WebSocket Gateway',
      'initialized',
      'success'
    );
  }

  async handleConnection(client: Socket) {
    LoggingUtils.logWebSocketEvent(this.logger, 'connected', client.id);
  }

  async handleDisconnect(client: Socket) {
    LoggingUtils.logWebSocketEvent(this.logger, 'disconnected', client.id);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, data: PingMessage): PongMessage {
    LoggingUtils.logWebSocketEvent(
      this.logger,
      'ping received',
      client.id,
      data
    );

    return {
      message: data.message,
      timestamp: Date.now(),
    };
  }

  @SubscribeMessage('notification')
  handleNotification(client: Socket, data: any): void {
    LoggingUtils.logWebSocketEvent(
      this.logger,
      'notification received',
      client.id,
      data
    );

    this.server.emit('notification', {
      from: client.id,
      data,
      timestamp: Date.now(),
    });
  }
}
