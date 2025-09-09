import { Logger } from '@nestjs/common';

/**
 * Утилиты для чистого и эффективного логирования
 */
export class LoggingUtils {
  /**
   * Логирует операцию с эмодзи и статусом
   */
  static logOperation(
    logger: Logger,
    operation: string,
    details: string,
    status: 'start' | 'success' | 'error' = 'start'
  ): void {
    const emoji =
      status === 'success' ? '✅' : status === 'error' ? '❌' : '🚀';
    logger.log(`${emoji} ${operation}: ${details}`);
  }

  /**
   * Условное debug логирование (только в dev режиме)
   */
  static debugIf(logger: Logger, condition: boolean, message: string): void {
    if (condition && process.env.NODE_ENV === 'development') {
      logger.debug(message);
    }
  }

  /**
   * Логирует ошибку с контекстом
   */
  static logError(
    logger: Logger,
    operation: string,
    error: Error,
    context?: Record<string, any>
  ): void {
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    logger.error(
      `❌ ${operation} failed: ${error.message}${contextStr}`,
      error.stack
    );
  }

  /**
   * Логирует предупреждение
   */
  static logWarning(
    logger: Logger,
    operation: string,
    message: string,
    context?: Record<string, any>
  ): void {
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    logger.warn(`⚠️ ${operation}: ${message}${contextStr}`);
  }

  /**
   * Генерирует уникальный ID для операции
   */
  static generateOperationId(
    prefix: string,
    ...identifiers: (string | number)[]
  ): string {
    return `${prefix}-${Date.now()}-${identifiers.join('-')}`;
  }

  /**
   * Логирует статистику выполнения
   */
  static logStats(
    logger: Logger,
    operation: string,
    stats: Record<string, any>
  ): void {
    logger.log(`📊 ${operation} stats: ${JSON.stringify(stats)}`);
  }

  /**
   * Логирует WebSocket события
   */
  static logWebSocketEvent(
    logger: Logger,
    event: string,
    clientId: string,
    data?: any
  ): void {
    const dataStr = data ? ` | Data: ${JSON.stringify(data)}` : '';
    logger.log(`🔌 WebSocket ${event} | Client: ${clientId}${dataStr}`);
  }
}
