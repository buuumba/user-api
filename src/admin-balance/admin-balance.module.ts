import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { User } from '../users/entities/user.entity';
import { AdminBalanceService } from './admin-balance.service';
import { AdminBalanceController } from './admin-balance.controller';
import { BalanceResetProcessor } from './processors/balance-reset.processor';
import { BALANCE_QUEUE } from './constants/queue.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
      name: BALANCE_QUEUE,
    }),
  ],
  providers: [AdminBalanceService, BalanceResetProcessor],
  controllers: [AdminBalanceController],
  exports: [AdminBalanceService],
})
export class AdminBalanceModule {}
