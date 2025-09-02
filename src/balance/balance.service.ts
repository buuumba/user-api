import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { User } from '../users/entities/user.entity';
import { TransferMoneyDto } from './dto/transfer-money.dto';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Transactional()
  async transferMoney(
    senderId: number,
    transferDto: TransferMoneyDto
  ): Promise<void> {
    const { recipientId, amount } = transferDto;

    // Проверяем, что пользователь не переводит сам себе
    if (senderId === recipientId) {
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
      throw new BadRequestException('Insufficient funds');
    }

    // Выполняем перевод
    sender.balance = Number((sender.balance - amount).toFixed(2));
    recipient.balance = Number((recipient.balance + amount).toFixed(2));

    // Сохраняем изменения в рамках транзакции
    await this.userRepository.save([sender, recipient]);
  }

  async getBalance(userId: number): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
      select: ['id', 'balance'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.balance;
  }
}
