import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PAGINATION_DEFAULTS } from '../constants/pagination.constants';

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Номер страницы для пагинации результатов',
    example: 1,
    default: 1,
    minimum: 1,
    type: 'integer',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = PAGINATION_DEFAULTS.PAGE;

  @ApiPropertyOptional({
    description: 'Количество записей на странице',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
    type: 'integer',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(PAGINATION_DEFAULTS.MAX_LIMIT, {
    message: `Limit must not exceed ${PAGINATION_DEFAULTS.MAX_LIMIT}`,
  })
  limit?: number = PAGINATION_DEFAULTS.LIMIT;

  @ApiPropertyOptional({
    description:
      'Фильтр по имени пользователя (поиск по частичному совпадению)',
    example: 'john',
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @MaxLength(30, { message: 'Username filter must not exceed 30 characters' })
  @Transform(({ value }) => value?.trim())
  username?: string;
}
