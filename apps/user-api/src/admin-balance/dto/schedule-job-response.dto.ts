import { ApiProperty } from '@nestjs/swagger';

export class ScheduleJobResponseDto {
  @ApiProperty({ example: '123' })
  jobId: string;

  @ApiProperty({
    example:
      'Balance reset job has been scheduled and will be processed shortly',
  })
  message: string;
}
