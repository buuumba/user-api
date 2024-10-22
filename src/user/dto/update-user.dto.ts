import {
  IsString,
  IsOptional,
  IsEmail,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional() // Поле может быть опциональным
  @MaxLength(30, { message: 'Username must not exceed 30 characters' }) // Максимум 30 символов
  username?: string;

  @IsEmail({}, { message: 'Invalid email address' }) // Валидация email
  @IsOptional() // Поле может быть опциональным
  email?: string;

  @IsString()
  @IsOptional() // Поле может быть опциональным
  @MinLength(6, { message: 'Password must be at least 6 characters long' }) // Минимум 6 символов
  password?: string;

  @IsInt()
  @IsOptional() // Поле может быть опциональным
  @Min(18, { message: 'Age must be at least 18' }) // Минимальный возраст - 18
  age?: number;

  @IsString()
  @IsOptional() // Поле может быть опциональным
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' }) // Максимум 1000 символов
  bio?: string;
}
