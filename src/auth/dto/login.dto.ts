import { IsString, IsNotEmpty, MinLength, MaxLength } from "class-validator";

export class LoginDto {
  @IsString() // Поле должно быть строкой
  @IsNotEmpty({ message: "Username is required" }) // Поле не должно быть пустым
  username: string;

  @IsString() // Поле должно быть строкой
  @IsNotEmpty({ message: "Password is required" }) // Поле не должно быть пустым
  @MinLength(6, { message: "Password must be at least 6 characters long" }) // Минимальная длина пароля - 6 символов
  @MaxLength(20, { message: "Password must not exceed 20 characters" }) // Максимальная длина пароля - 20 символов
  password: string;
}
