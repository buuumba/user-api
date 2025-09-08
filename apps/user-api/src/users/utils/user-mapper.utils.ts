import { plainToInstance } from 'class-transformer';
import { User } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { PaginatedUsersResponseDto } from '../dto/paginated-users-response.dto';
import { PaginatedResult } from '../../shared/interfaces';

//Преобразует User entity в UserResponseDto через plainToInstance

export const toUserResponseDto = (user: User): UserResponseDto => {
  return plainToInstance(UserResponseDto, user, {
    excludeExtraneousValues: true,
  });
};

//Безопасное преобразование с обработкой null

export const toUserResponseDtoSafe = (
  user: User | null
): UserResponseDto | null => {
  return user ? toUserResponseDto(user) : null;
};

// Преобразует массив пользователей

export const toUserResponseDtos = (users: User[]): UserResponseDto[] => {
  return plainToInstance(UserResponseDto, users, {
    excludeExtraneousValues: true,
  });
};

// Создает пагинированный ответ

export const toPaginatedUsersResponse = (
  result: PaginatedResult
): PaginatedUsersResponseDto => {
  return plainToInstance(PaginatedUsersResponseDto, result, {
    excludeExtraneousValues: true,
  });
};
