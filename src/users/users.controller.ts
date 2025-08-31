import {
  Body,
  Query,
  Controller,
  Get,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';

import { UserService } from './users.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { CurrentUser } from './interfaces/current-user.interface';
import {
  toUserResponseDto,
  toUserResponseDtoSafe,
  toPaginatedUsersResponse,
} from './utils/user-mapper.utils';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile/my')
  async getProfile(@User() user: CurrentUser): Promise<UserResponseDto | null> {
    const userEntity = await this.userService.findByUsername(user.username);
    return toUserResponseDtoSafe(userEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/my')
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
  async deleteProfile(@User() user: CurrentUser): Promise<void> {
    return this.userService.deleteUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
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
