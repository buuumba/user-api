import { plainToInstance } from 'class-transformer';
import { Avatar } from '../entities/avatars.entity';
import { AvatarResponseDto } from '../dto/avatar-response.dto';

export const toAvatarResponseDto = (avatar: Avatar): AvatarResponseDto => {
  return plainToInstance(AvatarResponseDto, avatar, {
    excludeExtraneousValues: true,
  });
};

export const toAvatarResponseDtoSafe = (
  avatar: Avatar | null
): AvatarResponseDto | null => {
  return avatar ? toAvatarResponseDto(avatar) : null;
};
