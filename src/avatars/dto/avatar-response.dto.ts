import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AvatarResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор аватара в системе',
    example: 1,
    type: 'integer',
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Имя файла загруженного аватара',
    example: '1756683116-avatar.jpg',
  })
  @Expose()
  filename: string;

  @ApiProperty({
    description: 'Дата загрузки аватара пользователем',
    example: '2025-08-31T09:18:00.702Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  created_at: Date;

  @ApiProperty({
    description: 'Дата последнего обновления аватара',
    example: '2025-08-31T09:18:00.702Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  updated_at: Date;
}
