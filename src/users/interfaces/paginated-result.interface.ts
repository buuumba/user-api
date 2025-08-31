import { User } from '../entities/user.entity';

export interface PaginatedResult<T = User> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
