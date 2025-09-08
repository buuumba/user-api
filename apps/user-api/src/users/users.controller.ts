import {
  Body,
  Query,
  Controller,
  Get,
  UseGuards,
  Patch,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';

import { UserService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '@app/common';
import { CurrentUser } from '@app/shared';
import {
  toUserResponseDto,
  toUserResponseDtoSafe,
  toPaginatedUsersResponse,
} from './utils/user-mapper.utils';
import { ProfileCacheInterceptor } from '../cache/interceptors/profile-cache.interceptor';

@ApiTags('Users')
@ApiBearerAuth('JWT-Auth')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile/my')
  @UseInterceptors(ProfileCacheInterceptor)
  @CacheTTL(30)
  @ApiOperation({
    summary: 'Получить профиль текущего пользователя',
    description: 'Возвращает профиль аутентифицированного пользователя',
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно получен',
    type: UserResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  async getProfile(@User() user: CurrentUser): Promise<UserResponseDto | null> {
    const userEntity = await this.userService.findByUsername(user.username);
    return toUserResponseDtoSafe(userEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/my')
  @ApiOperation({
    summary: 'Обновить профиль текущего пользователя',
    description: 'Обновляет данные аутентифицированного пользователя',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Профиль успешно обновлен',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  @ApiConflictResponse({
    description: 'Пользователь с таким логином или email уже существует',
  })
  async updateProfile(
    @User() user: CurrentUser,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const updatedUser = await this.userService.updateUser(
      user.id,
      updateUserDto
    );
    return toUserResponseDto(updatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/my')
  @ApiOperation({
    summary: 'Удалить профиль текущего пользователя',
    description: 'Выполняет мягкое удаление аутентифицированного пользователя',
  })
  @ApiResponse({ status: 200, description: 'Профиль успешно удален' })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async deleteProfile(@User() user: CurrentUser): Promise<void> {
    return this.userService.deleteUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('user-list')
  @CacheTTL(30)
  @ApiOperation({
    summary: 'Получить всех пользователей',
    description:
      'Возвращает всех пользователей с пагинацией и фильтрацией по username',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Номер страницы (по умолчанию 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description:
      'Количество записей на странице (по умолчанию 10, максимум 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'username',
    required: false,
    description: 'Фильтр по имени пользователя (поиск по вхождению)',
    example: 'john',
  })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
    type: PaginatedUsersResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Неверные учетные данные' })
  @ApiBadRequestResponse({ description: 'Ошибка валидации' })
  async getAllUsers(
    @Query() query: GetUsersQueryDto
  ): Promise<PaginatedUsersResponseDto> {
    const result = await this.userService.getAllUsers(
      query.page,
      query.limit,
      query.username
    );
    return toPaginatedUsersResponse(result);
  }
}
