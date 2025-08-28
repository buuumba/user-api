import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Маршрут для логина пользователя
  // Используем DTO для валидации данных логина
  @Post("login")
  async login(@Body() loginDto: LoginDto) {
    // Валидация пользователя с использованием данных из DTO
    const user = await this.authService.validateUser(
      loginDto.username, // Получаем username из DTO
      loginDto.password, // Получаем password из DTO
    );

    // Если пользователь не прошёл валидацию, возвращаем ошибку
    if (!user) {
      return { error: "Invalid credentials" };
    }
    // Если валидация успешна, генерируем и возвращаем JWT токен
    return this.authService.login(user);
  }
}
