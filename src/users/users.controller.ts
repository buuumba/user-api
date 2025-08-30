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

import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';
import { CurrentUser } from './interfaces/current-user.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.register(createUserDto);
    return this.userService.sanitizeUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/my')
  async getProfile(@User() user: CurrentUser) {
    const userEntity = await this.userService.findByUsername(user.username);
    return this.userService.sanitizeUser(userEntity);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/my')
  async updateProfile(
    @User() user: CurrentUser,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const updatedUser = await this.userService.updateUser(
      user.id,
      updateUserDto
    );
    return this.userService.sanitizeUser(updatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile/my')
  async deleteProfile(@User() user: CurrentUser): Promise<void> {
    return this.userService.deleteUser(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(@Query() query: GetUsersQueryDto) {
    return this.userService.getAllUsers(
      query.page,
      query.limit,
      query.username
    );
  }
}
