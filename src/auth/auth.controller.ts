import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { toUserResponseDto } from '../users/utils/user-mapper.utils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.authService.register(createUserDto);
    return toUserResponseDto(user);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }
}
