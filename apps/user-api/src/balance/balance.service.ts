import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { User } from '../users/entities/user.entity';
import { TransferMoneyDto } from './dto/transfer-money.dto';
import { LoggingUtils } from '@app/common';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    this.logger.log('BalanceService initialized');
  }

  @Transactional()
  async transferMoney(
    senderId: number,
    transferDto: TransferMoneyDto
  ): Promise<void> {
    const { recipientId, amount } = transferDto;
    const transferId = LoggingUtils.generateOperationId(
      'transfer',
      senderId,
      recipientId
    );

    LoggingUtils.logOperation(
      this.logger,
      'Money Transfer',
      `$${amount} from user ${senderId} to user ${recipientId} [${transferId}]`
    );

    try {
      // Проверяем, что пользователь не переводит сам себе
      if (senderId === recipientId) {
        LoggingUtils.logWarning(
          this.logger,
          'Money Transfer',
          'Self-transfer attempt',
          { transferId, senderId }
        );
        throw new BadRequestException('Cannot transfer money to yourself');
      }

      // Получаем отправителя и получателя
      const sender = await this.userRepository.findOne({
        where: { id: senderId, isDeleted: false },
      });

      if (!sender) {
        throw new NotFoundException('Sender not found');
      }

      const recipient = await this.userRepository.findOne({
        where: { id: recipientId, isDeleted: false },
      });

      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }

      // Проверяем достаточность средств
      if (sender.balance < amount) {
        LoggingUtils.logWarning(
          this.logger,
          'Money Transfer',
          'Insufficient funds',
          { transferId, senderId, available: sender.balance, required: amount }
        );
        throw new BadRequestException('Insufficient funds');
      }

      LoggingUtils.debugIf(
        this.logger,
        true,
        `Transfer details [${transferId}]: ${sender.username}($${sender.balance}) -> ${recipient.username}($${recipient.balance})`
      );

      // Выполняем перевод
      sender.balance = Number((sender.balance - amount).toFixed(2));
      recipient.balance = Number((recipient.balance + amount).toFixed(2));

      // Сохраняем изменения в рамках транзакции
      await this.userRepository.save([sender, recipient]);

      LoggingUtils.logOperation(
        this.logger,
        'Money Transfer',
        `$${amount} transferred successfully [${transferId}]`,
        'success'
      );

      LoggingUtils.logStats(this.logger, 'Money Transfer', {
        transferId,
        amount,
        senderFinalBalance: sender.balance,
        recipientFinalBalance: recipient.balance,
      });
    } catch (error) {
      LoggingUtils.logError(this.logger, 'Money Transfer', error, {
        transferId,
        senderId,
        recipientId,
        amount,
      });
      throw error;
    }
  }

  async getBalance(userId: number): Promise<number> {
    LoggingUtils.logOperation(this.logger, 'Get Balance', `User ${userId}`);

    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isDeleted: false },
        select: ['id', 'balance'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      LoggingUtils.logOperation(
        this.logger,
        'Get Balance',
        `User ${userId} balance: $${user.balance}`,
        'success'
      );

      return user.balance;
    } catch (error) {
      LoggingUtils.logError(this.logger, 'Get Balance', error, { userId });
      throw error;
    }
  }
}
