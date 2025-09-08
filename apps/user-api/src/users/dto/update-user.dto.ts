import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsInt,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Обновляет имя пользователя для входа в систему',
    example: 'john_doe_updated',
    maxLength: 30,
  })
  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  username?: string;

  @ApiPropertyOptional({
    description: 'Обновляет email адрес для связи и уведомлений',
    example: 'john.new@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Устанавливает новый пароль для доступа к аккаунту',
    example: 'newSecurePassword123',
    minLength: 6,
  })
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Обновляет возраст пользователя в годах',
    example: 26,
    minimum: 18,
    type: 'integer',
  })
  @IsInt()
  @IsOptional()
  @Min(18, { message: 'Age must be at least 18' })
  age?: number;

  @ApiPropertyOptional({
    description: 'Обновляет дополнительную информацию о пользователе',
    example: 'Senior Software Developer from Saint Petersburg',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
  bio?: string;
}
