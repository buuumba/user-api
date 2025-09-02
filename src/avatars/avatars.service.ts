import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avatar } from './entities/avatars.entity';
import { IFileService } from 'src/providers/files/files.adapter';
import { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';

@Injectable()
export class AvatarsService {
  private readonly logger = new Logger(AvatarsService.name);
  private readonly maxActiveAvatars = 5;

  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
    private readonly fileService: IFileService
  ) {}

  async uploadAvatar(
    userId: number,
    file: IUploadedMulterFile
  ): Promise<Avatar> {
    const activeAvatarsCount = await this.avatarRepository.count({
      where: { user: { id: userId }, isDeleted: false },
    });

    if (activeAvatarsCount >= this.maxActiveAvatars) {
      throw new BadRequestException(
        `Maximum ${this.maxActiveAvatars} avatars allowed`
      );
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    try {
      await this.fileService.uploadFile({
        file,
        folder: 'avatars',
        name: fileName,
        accountId: userId.toString(),
      });
    } catch (error) {
      this.logger.error('Failed to upload file', error.stack);
      throw new BadRequestException('Failed to upload file');
    }

    const avatar = this.avatarRepository.create({
      filename: fileName,
      user: { id: userId },
      isDeleted: false,
    });

    const savedAvatar = await this.avatarRepository.save(avatar);
    this.logger.log(`Avatar uploaded for user ${userId}`);

    return savedAvatar;
  }

  async deleteAvatar(userId: number, avatarId: number): Promise<void> {
    const avatar = await this.avatarRepository.findOne({
      where: { id: avatarId, user: { id: userId }, isDeleted: false },
    });

    if (!avatar) {
      throw new NotFoundException('Avatar not found');
    }

    try {
      await this.fileService.removeFile({ path: avatar.filename });
    } catch (error) {
      this.logger.error('Failed to remove file', error.stack);
      throw new BadRequestException('Failed to remove file');
    }

    avatar.isDeleted = true;
    await this.avatarRepository.save(avatar);

    this.logger.log(`Avatar ${avatarId} deleted for user ${userId}`);
  }
}
