import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';

import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { toUserResponseDto } from '../users/utils/user-mapper.utils';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация нового пользователя',
    description: 'Создает нового пользователя в системе',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  @ApiConflictResponse({
    description: 'Пользователь с таким логином или email уже существует',
  })
  async register(
    @Body() createUserDto: CreateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.authService.register(createUserDto);
    return toUserResponseDto(user);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Вход в систему',
    description: 'Входит в систему пользователем',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно вошел в систему',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
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
