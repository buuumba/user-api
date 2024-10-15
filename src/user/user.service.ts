import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // Регистрация пользователя
  async register(createUserDto: CreateUserDto): Promise<User> {
    // Проверка на существование пользователя с таким же username или email
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new BadRequestException(
        'User with this username or email already exists'
      );
    }

    if (!createUserDto.password) {
      throw new Error('Password is required');
    }

    // Хэшируем пароль перед сохранением
    const hashedPassword = await argon2.hash(createUserDto.password);
    // Создаем нового пользователя, объединяя DTO и захэшированный пароль
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  // Поиск пользователя по username
  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  // Обновление данных пользователя
  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  // Удаление пользователя
  async deleteUser(userId: number): Promise<void> {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
  
  // Получение всех пользователей с пагинацией и фильтрацией
  async getAllUsers(
    page: number,
    limit: number,
    username?: string
  ): Promise<any> {
    const query = this.userRepository.createQueryBuilder('user');

    // Если передан параметр для поиска по логину, добавляем фильтр
    if (username) {
      query.where('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    // Пагинация: пропускаем записи для предыдущих страниц и берем лимит записей для текущей страницы
    query.skip((page - 1) * limit).take(limit);

    // Выполняем запрос с подсчетом общего количества пользователей
    const [users, total] = await query.getManyAndCount();

    return {
      total,
      page,
      limit,
      data: users,
    };
  }
}
