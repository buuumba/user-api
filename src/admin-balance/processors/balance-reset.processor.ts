import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AdminBalanceService } from '../admin-balance.service';
import { BALANCE_QUEUE, BALANCE_JOBS } from '../constants/queue.constants';
import {
  BalanceResetJobData,
  BalanceResetJobResult,
} from '../interfaces/balance-job.interface';
import { LoggingUtils } from '../../common/utils/logging.utils';

@Processor(BALANCE_QUEUE)
export class BalanceResetProcessor {
  private readonly logger = new Logger(BalanceResetProcessor.name);

  constructor(private readonly adminBalanceService: AdminBalanceService) {
    this.logger.log('BalanceResetProcessor initialized');
    this.logger.debug(`Listening for jobs in queue: ${BALANCE_QUEUE}`);
    this.logger.debug(
      `Processing job type: ${BALANCE_JOBS.RESET_ALL_BALANCES}`
    );
  }

  @Process(BALANCE_JOBS.RESET_ALL_BALANCES)
  async processBalanceReset(
    job: Job<BalanceResetJobData>
  ): Promise<BalanceResetJobResult> {
    const startTime = Date.now();
    const { adminId, reason } = job.data;

    LoggingUtils.logOperation(
      this.logger,
      'Job Processing',
      `Balance reset job ${job.id} by admin ${adminId}${reason ? ` (${reason})` : ''}`
    );

    try {
      // Начало обработки
      await job.progress(10);

      LoggingUtils.debugIf(
        this.logger,
        true,
        `Job ${job.id} processing started - attempt ${job.attemptsMade + 1}/${job.opts.attempts}`
      );

      // Выполнение обнуления балансов
      const result = await this.adminBalanceService.resetAllBalances();

      // Завершение
      await job.progress(100);

      const totalDuration = Date.now() - startTime;

      LoggingUtils.logOperation(
        this.logger,
        'Job Processing',
        `Job ${job.id} completed in ${totalDuration}ms`,
        'success'
      );

      LoggingUtils.logStats(this.logger, 'Job Processing', {
        jobId: job.id,
        adminId,
        usersProcessed: result.totalUsersProcessed,
        duration: `${totalDuration}ms`,
        success: result.success,
      });

      return result;
    } catch (error) {
      const failedDuration = Date.now() - startTime;

      LoggingUtils.logError(this.logger, 'Job Processing', error, {
        jobId: job.id,
        adminId,
        attempt: `${job.attemptsMade + 1}/${job.opts.attempts}`,
        duration: `${failedDuration}ms`,
      });

      // Сбросить прогресс при ошибке
      try {
        await job.progress(0);
      } catch (progressError) {
        LoggingUtils.logWarning(
          this.logger,
          'Job Processing',
          'Failed to reset progress',
          { jobId: job.id, error: progressError.message }
        );
      }

      throw error;
    }
  }
}
