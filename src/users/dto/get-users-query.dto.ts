import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PAGINATION_DEFAULTS } from '../constants/pagination.constants';

export class GetUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = PAGINATION_DEFAULTS.PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(PAGINATION_DEFAULTS.MAX_LIMIT, {
    message: `Limit must not exceed ${PAGINATION_DEFAULTS.MAX_LIMIT}`,
  })
  limit?: number = PAGINATION_DEFAULTS.LIMIT;

  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MaxLength(30, { message: 'Username filter must not exceed 30 characters' })
  @Transform(({ value }) => value?.trim())
  username?: string;
}
