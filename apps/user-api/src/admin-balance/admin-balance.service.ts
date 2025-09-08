import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { BALANCE_QUEUE, BALANCE_JOBS } from './constants/queue.constants';
import {
  BalanceResetJobData,
  BalanceResetJobResult,
} from './interfaces/balance-job.interface';
import { ScheduleJobResponseDto } from './dto/schedule-job-response.dto';
import { JobStatusResponseDto } from './dto/job-status-response.dto';
import { LoggingUtils } from '@app/common';

@Injectable()
export class AdminBalanceService {
  private readonly logger = new Logger(AdminBalanceService.name);

  constructor(
    @InjectQueue(BALANCE_QUEUE) private readonly balanceQueue: Queue,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource
  ) {
    this.logger.log('AdminBalanceService initialized');
    this.logger.debug(`Connected to queue: ${BALANCE_QUEUE}`);
  }

  async scheduleBalanceReset(
    adminId: number,
    reason?: string
  ): Promise<ScheduleJobResponseDto> {
    const details = `Admin ${adminId}${reason ? ` (${reason})` : ''}`;
    LoggingUtils.logOperation(this.logger, 'Balance Reset Schedule', details);

    try {
      const jobData: BalanceResetJobData = {
        adminId,
        timestamp: new Date(),
        reason,
      };

      const jobOptions = {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      };

      const job = await this.balanceQueue.add(
        BALANCE_JOBS.RESET_ALL_BALANCES,
        jobData,
        jobOptions
      );

      LoggingUtils.logOperation(
        this.logger,
        'Balance Reset Schedule',
        `Job ${job.id} created successfully`,
        'success'
      );

      LoggingUtils.debugIf(
        this.logger,
        true,
        `Job details: ${JSON.stringify({ id: job.id, adminId, reason })}`
      );

      return {
        jobId: job.id.toString(),
        message: 'Balance reset job has been scheduled',
      };
    } catch (error) {
      LoggingUtils.logError(this.logger, 'Balance Reset Schedule', error, {
        adminId,
        reason,
      });
      throw new BadRequestException(
        'Failed to schedule job: Redis connection issue'
      );
    }
  }

  async getJobStatus(jobId: string): Promise<JobStatusResponseDto> {
    LoggingUtils.logOperation(
      this.logger,
      'Job Status Check',
      `Job ID: ${jobId}`
    );

    try {
      const job = await this.balanceQueue.getJob(jobId);

      if (!job) {
        LoggingUtils.logWarning(
          this.logger,
          'Job Status Check',
          'Job not found',
          { jobId }
        );
        return {
          id: jobId,
          status: 'not_found',
          progress: 0,
          failedReason: 'Job not found',
        };
      }

      const state = await job.getState();
      const progress = job.progress();

      LoggingUtils.logOperation(
        this.logger,
        'Job Status Check',
        `Job ${jobId} status: ${state} (${progress}%)`,
        'success'
      );

      LoggingUtils.debugIf(
        this.logger,
        job.failedReason !== undefined,
        `Job ${jobId} failed reason: ${job.failedReason}`
      );

      return {
        id: job.id.toString(),
        status: state,
        progress,
        result: job.returnvalue,
        failedReason: job.failedReason,
      };
    } catch (error) {
      LoggingUtils.logError(this.logger, 'Job Status Check', error, { jobId });
      throw error;
    }
  }

  async resetAllBalances(): Promise<BalanceResetJobResult> {
    const startTime = Date.now();
    const operationId = LoggingUtils.generateOperationId('reset', startTime);

    LoggingUtils.logOperation(
      this.logger,
      'Mass Balance Reset',
      `Operation ID: ${operationId}`
    );

    try {
      const userCount = await this.userRepository.count({
        where: { isDeleted: false },
      });

      if (userCount === 0) {
        LoggingUtils.logWarning(
          this.logger,
          'Mass Balance Reset',
          'No active users found'
        );
        return {
          success: true,
          totalUsersProcessed: 0,
          duration: Date.now() - startTime,
          message: 'No active users found to reset',
        };
      }

      LoggingUtils.debugIf(
        this.logger,
        true,
        `Found ${userCount} active users to reset [${operationId}]`
      );

      const result = await this.dataSource.query(
        `UPDATE "users" SET balance = 0.00 WHERE "isDeleted" = false`
      );
      const duration = Date.now() - startTime;

      const stats = {
        expected: userCount,
        processed: result[1],
        duration: `${duration}ms`,
        operationId,
      };

      LoggingUtils.logOperation(
        this.logger,
        'Mass Balance Reset',
        `Completed successfully - ${result[1]} users processed`,
        'success'
      );

      LoggingUtils.logStats(this.logger, 'Mass Balance Reset', stats);

      return {
        success: true,
        totalUsersProcessed: result[1],
        duration,
        message: `Successfully reset balances for ${result[1]} users`,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      LoggingUtils.logError(this.logger, 'Mass Balance Reset', error, {
        operationId,
        duration: `${duration}ms`,
      });

      return {
        success: false,
        totalUsersProcessed: 0,
        duration,
        message: `Balance reset failed: ${error.message}`,
      };
    }
  }
}
