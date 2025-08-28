import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // Метод для валидации пользователя при логине
  async validateUser(username: string, password: string): Promise<any> {
    // Поиск пользователя по username
    const user = await this.userService.findByUsername(username);
    // Если пользователь найден и пароль верен
    if (user && (await argon2.verify(user.password, password))) {
      // Убираем пароль из объекта пользователя для безопасности
      const { password, ...result } = user;
      return result; // Возвращаем данные пользователя без пароля
    }
    return null; // Если пользователь не найден или пароль неверен
  }

  // Метод для генерации JWT токена при успешном логине
  async login(user: any) {
    // Формируем payload для токена, включающий username и id пользователя
    const payload = { username: user.username, sub: user.id };
    // Возвращаем объект с access_token (expiresIn уже настроен в JwtModule)
    return {
      access_token: this.jwtService.sign(payload), // Подписываем токен с использованием JWT сервиса
    };
  }
}
