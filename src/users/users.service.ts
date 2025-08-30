import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PAGINATION_DEFAULTS } from './constants/pagination.constants';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this username or email already exists'
      );
    }

    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({
      where: { username, isDeleted: false },
    });
  }

  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isDeleted: false },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Проверяем уникальность username и email перед обновлением
    if (updateUserDto.username || updateUserDto.email) {
      const whereConditions = [];

      if (updateUserDto.username && updateUserDto.username !== user.username) {
        whereConditions.push({ username: updateUserDto.username });
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        whereConditions.push({ email: updateUserDto.email });
      }

      if (whereConditions.length > 0) {
        const conflictUser = await this.userRepository.findOne({
          where: whereConditions,
        });

        if (conflictUser) {
          throw new ConflictException(
            'User with this username or email already exists'
          );
        }
      }
    }

    // Хешируем пароль если он обновляется
    if (updateUserDto.password) {
      updateUserDto.password = await argon2.hash(updateUserDto.password);
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.isDeleted = true;
    await this.userRepository.save(user);
  }

  async getAllUsers(
    page: number = PAGINATION_DEFAULTS.PAGE,
    limit: number = PAGINATION_DEFAULTS.LIMIT,
    username?: string
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    data: Omit<User, 'password'>[];
  }> {
    const query = this.userRepository.createQueryBuilder('user');

    query.where('user.isDeleted = :isDeleted', { isDeleted: false });

    if (username) {
      query.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    // Ограничиваем лимит максимальным значением
    const safeLimit = Math.min(limit, PAGINATION_DEFAULTS.MAX_LIMIT);

    query.skip((page - 1) * safeLimit).take(safeLimit);

    const [users, total] = await query.getManyAndCount();

    // Убираем пароли из ответа для безопасности
    const safeUsers = users.map(({ password: _, ...user }) => user);

    return {
      total,
      page,
      limit: safeLimit,
      data: safeUsers,
    };
  }

  // Метод для безопасного возврата пользователя без пароля
  sanitizeUser(user: User): Omit<User, 'password'> {
    const { password: _, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
