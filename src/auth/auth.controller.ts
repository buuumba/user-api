import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Маршрут для логина пользователя
  @Post('login')
  async login(@Body() body) {
    // Валидация пользователя (проверка логина и пароля)
    const user = await this.authService.validateUser(
      body.username,
      body.password
    );

    // Если пользователь не прошёл валидацию, возвращаем ошибку
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    // Если валидация успешна, генерируем и возвращаем JWT токен
    return this.authService.login(user);
  }
}
