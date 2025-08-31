import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersResponseDto {
  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  @Type(() => UserResponseDto)
  data: UserResponseDto[];
}
