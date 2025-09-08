export interface PaginatedResult<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
