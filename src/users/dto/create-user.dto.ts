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

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Username is required' }) // Логин обязателен
  @MaxLength(30, { message: 'Username must not exceed 30 characters' }) // Максимум 30 символов
  username: string;

  @IsEmail({}, { message: 'Invalid email address' }) // Валидация email
  @IsNotEmpty({ message: 'Email is required' }) // Email обязателен
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' }) // Пароль обязателен
  @MinLength(6, { message: 'Password must be at least 6 characters long' }) // Минимум 6 символов
  password: string;

  @IsInt()
  @Min(18, { message: 'Age must be at least 18' }) // Минимальный возраст - 18
  age: number;

  @IsString()
  @IsOptional() // Bio может быть опциональным
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' }) // Максимум 1000 символов для био
  bio?: string;
}
