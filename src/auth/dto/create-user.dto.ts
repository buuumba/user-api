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
  @IsNotEmpty({ message: 'Username is required' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  username: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsInt()
  @Min(18, { message: 'Age must be at least 18' })
  age: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Bio must not exceed 1000 characters' })
  bio?: string;
}
