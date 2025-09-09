import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { NotificationGateway } from '../notification.gateway';

export async function createNestApp(
  gateway: NotificationGateway
): Promise<INestApplication> {
  const module = await Test.createTestingModule({
    providers: [gateway],
  }).compile();

  const app = module.createNestApplication();
  await app.listen(3000);
  return app;
}
