import { Expose } from 'class-transformer';

export class AvatarResponseDto {
  @Expose()
  id: number;

  @Expose()
  filename: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
