import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';
import { Server } from 'socket.io';
import { createNestApp } from './test-utils/create-nest-app';

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;
  let app: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationGateway],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
    app = await createNestApp(gateway);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit "pong" on "ping"', async () => {
    const { ioClient } = await import('socket.io-client');

    const client = ioClient('http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    client.connect();
    client.emit('ping', { message: 'Hello world!' });

    await new Promise<void>((resolve, reject) => {
      client.on('connect', () => {
        console.log('connected');
      });

      client.on('pong', (data: any) => {
        try {
          expect(data.data).toBe('Hello world!');
          expect(data.timestamp).toBeDefined();
          resolve();
        } catch (ex) {
          reject(ex);
        }
      });
    });

    client.disconnect();
  });
});
