import {
  Body,
  Query,
  Controller,
  Post,
  Get,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../auth/decorators/user.decorator'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Регистрация нового пользователя
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.userService.register(createUserDto);
  }

  // Получение профиля текущего пользователя (доступно только авторизованным пользователям)
  @UseGuards(JwtAuthGuard)
  @Get('profile/my')
  getProfile(@User() user: any) {
    return this.userService.findByUsername(user.username);
  }

  // Обновление профиля текущего пользователя (требует авторизации)
  @UseGuards(JwtAuthGuard)
  @Patch('profile/my')
  async updateProfile(@User() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(user.userId, updateUserDto);
  }

  // Удаление профиля текущего пользователя (требует авторизации)
  @UseGuards(JwtAuthGuard)
  @Delete('profile/my')
  deleteProfile(@User() user: any) {
    return this.userService.deleteUser(user.userId);
  }

  // Получение списка пользователей с поддержкой пагинации и фильтрации
  @UseGuards(JwtAuthGuard)
  @Get('users')
  getAllUsers(
    @Query('page') page: number = 1, // Параметр для страницы (по умолчанию 1)
    @Query('limit') limit: number = 10, // Параметр для лимита записей (по умолчанию 10)
    @Query('username') username?: string // Параметр для фильтрации по логину
  ) {
    return this.userService.getAllUsers(page, limit, username);
  }

  // Получение списка удаленных пользователей (soft deleted)
  @UseGuards(JwtAuthGuard)
  @Get('deleted-users')
  getDeletedUsers(
    @Query('page') page: number = 1, // Параметр для страницы (по умолчанию 1)
    @Query('limit') limit: number = 10 // Параметр для лимита записей (по умолчанию 10)
  ) {
    return this.userService.getDeletedUsers(page, limit);
  }
}

