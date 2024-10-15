import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// Кастомный Guard для защиты маршрутов с использованием JWT
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Вызов родительского метода для стандартной логики JWT Guard
    return super.canActivate(context);
  }

  // Обрабатываем результат валидации JWT токена
  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
