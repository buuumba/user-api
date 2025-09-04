import { Body, Controller, Get, Post, UseGuards, Logger } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { BalanceService } from './balance.service';
import { TransferMoneyDto } from './dto/transfer-money.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { LoggingUtils } from '../common/utils/logging.utils';

@ApiTags('Balance')
@ApiBearerAuth('JWT-Auth')
@Controller('balance')
export class BalanceController {
  private readonly logger = new Logger(BalanceController.name);

  constructor(private readonly balanceService: BalanceService) {
    this.logger.log('BalanceController initialized');
  }

  @UseGuards(JwtAuthGuard)
  @Post('transfer')
  @ApiOperation({
    summary: 'Перевести деньги другому пользователю',
    description:
      'Переводит указанную сумму с баланса текущего пользователя на баланс получателя',
  })
  @ApiBody({ type: TransferMoneyDto })
  @ApiResponse({
    status: 200,
    description: 'Перевод успешно выполнен',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Successfully transferred $25.50 to user ID 2',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description:
      'Недостаточно средств, некорректная сумма или попытка перевода самому себе',
  })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  @ApiNotFoundResponse({ description: 'Получатель не найден' })
  async transferMoney(
    @User() user: CurrentUser,
    @Body() transferDto: TransferMoneyDto
  ): Promise<{ message: string }> {
    LoggingUtils.logOperation(
      this.logger,
      'Transfer Request',
      `POST /balance/transfer by ${user.username} (ID: ${user.id})`
    );

    try {
      await this.balanceService.transferMoney(user.id, transferDto);

      const response = {
        message: `Successfully transferred $${transferDto.amount} to user ID ${transferDto.recipientId}`,
      };

      LoggingUtils.logOperation(
        this.logger,
        'Transfer Request',
        `$${transferDto.amount} transferred successfully`,
        'success'
      );

      return response;
    } catch (error) {
      LoggingUtils.logError(this.logger, 'Transfer Request', error, {
        userId: user.id,
        username: user.username,
        recipientId: transferDto.recipientId,
        amount: transferDto.amount,
      });
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Получить баланс текущего пользователя',
    description: 'Возвращает текущий баланс аутентифицированного пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Баланс успешно получен',
    schema: {
      type: 'object',
      properties: {
        balance: {
          type: 'number',
          example: 150.75,
          description: 'Текущий баланс в долларах',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async getBalance(@User() user: CurrentUser): Promise<{ balance: number }> {
    LoggingUtils.logOperation(
      this.logger,
      'Balance Request',
      `GET /balance by ${user.username} (ID: ${user.id})`
    );

    try {
      const balance = await this.balanceService.getBalance(user.id);

      LoggingUtils.logOperation(
        this.logger,
        'Balance Request',
        `Balance retrieved: $${balance}`,
        'success'
      );

      return { balance };
    } catch (error) {
      LoggingUtils.logError(this.logger, 'Balance Request', error, {
        userId: user.id,
        username: user.username,
      });
      throw error;
    }
  }
}
