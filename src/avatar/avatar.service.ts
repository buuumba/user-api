import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Avatar } from "./avatar.entity";
import { User } from "../user/user.entity";
import * as Minio from "minio";

@Injectable()
export class AvatarService {
  private readonly minioClient: Minio.Client;

  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
  ) {}

  async uploadAvatar(user: User, filename: string): Promise<Avatar> {
    const activeAvatars = await this.avatarRepository.count({
      where: { user, isActive: true },
    });

    if (activeAvatars >= 5) {
      throw new BadRequestException("You can have up to 5 active avatars.");
    }

    const avatar = this.avatarRepository.create({ user, filename });
    return this.avatarRepository.save(avatar);
  }

  async deleteAvatar(user: User, id: number): Promise<void> {
    const avatar = await this.avatarRepository.findOne({
      where: { id, user, isActive: true },
    });

    if (!avatar) {
      throw new NotFoundException("Avatar not found or already deleted.");
    }

    avatar.isActive = false;
    await this.avatarRepository.save(avatar);
  }
}
