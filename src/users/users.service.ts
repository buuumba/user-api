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
    page: number,
    limit: number,
    username?: string
  ): Promise<any> {
    const query = this.userRepository.createQueryBuilder('user');

    query.where('user.isDeleted = :isDeleted', { isDeleted: false });

    if (username) {
      query.where('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    query.skip((page - 1) * limit).take(limit);

    const [users, total] = await query.getManyAndCount();

    return {
      total,
      page,
      limit,
      data: users,
    };
  }

  async getDeletedUsers(page: number, limit: number): Promise<any> {
    const query = this.userRepository.createQueryBuilder('user');

    query.where('user.isDeleted = :isDeleted', { isDeleted: true });

    query.skip((page - 1) * limit).take(limit);

    const [users, total] = await query.getManyAndCount();

    return {
      total,
      page,
      limit,
      data: users,
    };
  }
}
