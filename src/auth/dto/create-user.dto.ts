import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Уникальное имя пользователя для входа в систему',
    example: 'john_doe',
    maxLength: 30,
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  username: string;

  @ApiProperty({
    description: 'Email адрес пользователя для связи и уведомлений',
    example: 'john@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Пароль для доступа к аккаунту',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    description: 'Возраст пользователя в годах',
    example: 25,
    minimum: 18,
    type: 'integer',
  })
  @IsInt()
  @Min(18, { message: 'Age must be at least 18' })
  age: number;

  @ApiPropertyOptional({
    description: 'Дополнительная информация о пользователе',
    example: 'Software developer from Moscow',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
  bio?: string;
}
