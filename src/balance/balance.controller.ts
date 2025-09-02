import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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

@ApiTags('Balance')
@ApiBearerAuth('JWT-Auth')
@Controller('balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

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
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Получатель не найден' })
  async transferMoney(
    @User() user: CurrentUser,
    @Body() transferDto: TransferMoneyDto
  ): Promise<{ message: string }> {
    await this.balanceService.transferMoney(user.id, transferDto);
    return {
      message: `Successfully transferred $${transferDto.amount} to user ID ${transferDto.recipientId}`,
    };
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
  @ApiUnauthorizedResponse({ description: 'Требуется авторизация' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async getBalance(@User() user: CurrentUser): Promise<{ balance: number }> {
    const balance = await this.balanceService.getBalance(user.id);
    return { balance };
  }
}
