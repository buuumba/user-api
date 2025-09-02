import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Общее количество пользователей в системе',
    example: 150,
    type: 'integer',
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Номер текущей страницы результатов',
    example: 1,
    type: 'integer',
  })
  @Expose()
  page: number;

  @ApiProperty({
    description: 'Количество записей на текущей странице',
    example: 10,
    type: 'integer',
  })
  @Expose()
  limit: number;

  @ApiProperty({
    description: 'Массив пользователей на текущей странице',
    type: [UserResponseDto],
  })
  @Expose()
  @Type(() => UserResponseDto)
  data: UserResponseDto[];
}
