import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  age: number;

  @Expose()
  bio: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;
}
