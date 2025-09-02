import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя в системе',
    example: 1,
    type: 'integer',
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Имя пользователя для входа в систему',
    example: 'john_doe',
  })
  @Expose()
  username: string;

  @ApiProperty({
    description: 'Email адрес пользователя для связи и уведомлений',
    example: 'john@example.com',
    format: 'email',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Возраст пользователя в годах',
    example: 25,
    type: 'integer',
  })
  @Expose()
  age: number;

  @ApiProperty({
    description: 'Дополнительная информация о пользователе',
    example: 'Software developer from Moscow',
  })
  @Expose()
  bio: string;

  @ApiProperty({
    description: 'Баланс пользователя в долларах',
    example: 150.75,
    type: 'number',
  })
  @Expose()
  balance: number;

  @ApiProperty({
    description: 'Дата создания профиля пользователя',
    example: '2025-08-31T09:18:00.702Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  created_at: Date;

  @ApiProperty({
    description: 'Дата последнего обновления профиля',
    example: '2025-08-31T09:25:55.577Z',
    type: 'string',
    format: 'date-time',
  })
  @Expose()
  updated_at: Date;
}
