import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(
      body.username,
      body.password
    );
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    return this.authService.login(user);
  }
}
