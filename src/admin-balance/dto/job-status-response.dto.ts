import { ApiProperty } from '@nestjs/swagger';
import { BalanceResetJobResult } from '../interfaces/balance-job.interface';

export class JobStatusResponseDto {
  @ApiProperty({ example: '123' })
  id: string;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ example: 100 })
  progress: number;

  @ApiProperty()
  result?: BalanceResetJobResult;

  @ApiProperty()
  failedReason?: string;
}
