import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Param,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { AdminBalanceService } from './admin-balance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { ResetBalanceDto } from './dto/reset-balance.dto';
import { ScheduleJobResponseDto } from './dto/schedule-job-response.dto';
import { JobStatusResponseDto } from './dto/job-status-response.dto';
import { LoggingUtils } from '../common/utils/logging.utils';

@ApiTags('Admin Balance')
@ApiBearerAuth('JWT-Auth')
@Controller('admin/balance')
export class AdminBalanceController {
  private readonly logger = new Logger(AdminBalanceController.name);

  constructor(private readonly adminBalanceService: AdminBalanceService) {
    this.logger.log('AdminBalanceController initialized');
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset-all')
  @ApiOperation({
    summary: 'Обнулить балансы всех пользователей (ADMIN)',
    description:
      'Запускает job для обнуления балансов всех пользователей в системе',
  })
  @ApiBody({ type: ResetBalanceDto })
  @ApiResponse({
    status: 200,
    description: 'Job для обнуления балансов успешно запущен',
    schema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          example: '123',
          description: 'ID задачи в очереди',
        },
        message: {
          type: 'string',
          example:
            'Balance reset job has been scheduled and will be processed shortly',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  async resetAllBalances(
    @User() user: CurrentUser,
    @Body() resetDto: ResetBalanceDto
  ): Promise<ScheduleJobResponseDto> {
    LoggingUtils.logOperation(
      this.logger,
      'Admin Reset Request',
      `POST /admin/balance/reset-all by ${user.username} (ID: ${user.id})`
    );

    try {
      const result = await this.adminBalanceService.scheduleBalanceReset(
        user.id,
        resetDto.reason
      );

      LoggingUtils.logOperation(
        this.logger,
        'Admin Reset Request',
        `Job ${result.jobId} scheduled successfully`,
        'success'
      );

      return result;
    } catch (error) {
      LoggingUtils.logError(this.logger, 'Admin Reset Request', error, {
        adminId: user.id,
        adminUsername: user.username,
        reason: resetDto.reason,
      });
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('job/:jobId')
  @ApiOperation({
    summary: "Получить статус job'а обнуления балансов",
    description: 'Возвращает текущий статус и прогресс выполнения задачи',
  })
  @ApiParam({
    name: 'jobId',
    description: 'ID задачи в очереди',
    example: '123',
  })
  @ApiResponse({
    status: 200,
    description: 'Статус задачи получен',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '123' },
        status: { type: 'string', example: 'completed' },
        progress: { type: 'number', example: 100 },
        result: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            totalUsersProcessed: { type: 'number', example: 1500 },
            duration: { type: 'number', example: 2340 },
            message: {
              type: 'string',
              example: 'Successfully reset balances for 1500 users',
            },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  @ApiNotFoundResponse({ description: 'Job не найден' })
  async getJobStatus(
    @Param('jobId') jobId: string
  ): Promise<JobStatusResponseDto> {
    LoggingUtils.logOperation(
      this.logger,
      'Admin Job Status',
      `GET /admin/balance/job/${jobId}`
    );

    try {
      const result = await this.adminBalanceService.getJobStatus(jobId);

      LoggingUtils.logOperation(
        this.logger,
        'Admin Job Status',
        `Job ${jobId} status: ${result.status}`,
        'success'
      );

      return result;
    } catch (error) {
      LoggingUtils.logError(this.logger, 'Admin Job Status', error, { jobId });
      throw error;
    }
  }
}
