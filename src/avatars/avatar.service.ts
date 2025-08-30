import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avatar } from './avatar.entity';
import { User } from '../users/entities/user.entity';
import { IFileService } from 'src/providers/files/files.adapter';
import { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);

  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
    private readonly fileService: IFileService
  ) {}

  /**
   * Загрузка аватара пользователя.
   */
  async uploadAvatar(
    user: User,
    file: IUploadedMulterFile,
    accountId: string
  ): Promise<Avatar> {
    // Проверяем количество активных аватаров
    const activeAvatars = await this.avatarRepository.count({
      where: { user, isActive: true },
    });

    if (activeAvatars >= 5) {
      throw new BadRequestException('You can have up to 5 active avatars.');
    }

    // Генерация уникального имени файла
    const fileName = `${Date.now()}-${file.originalname}`;

    let path: string;
    try {
      const result = await this.fileService.uploadFile({
        file, // Передаём весь объект файла
        folder: 'avatars', // Папка для хранения файлов
        name: fileName, // Уникальное имя файла
        accountId, // ID аккаунта
      });
      path = result.path;
    } catch (error) {
      this.logger.error('Failed to upload file to file service', error.stack);
      throw new BadRequestException('Failed to upload file.');
    }

    // Создание записи аватара в базе данных
    const avatar = this.avatarRepository.create({
      filename: path, // Путь или имя файла
      user,
      isActive: true,
    });

    await this.avatarRepository.save(avatar);

    this.logger.log(`Avatar uploaded successfully for user ${user.id}`);
    return avatar;
  }

  /**
   * Удаление аватара пользователя.
   */
  async deleteAvatar(user: User, avatarId: number): Promise<void> {
    // Поиск аватара в базе данных
    const avatar = await this.avatarRepository.findOne({
      where: { id: avatarId, user, isActive: true },
    });

    if (!avatar) {
      throw new NotFoundException('Avatar not found or already deleted.');
    }

    try {
      // Удаление файла через fileService
      await this.fileService.removeFile({ path: avatar.filename });
    } catch (error) {
      this.logger.error('Failed to remove file from file service', error.stack);
      throw new BadRequestException('Failed to remove file.');
    }

    // Пометка аватара как неактивного (soft delete)
    avatar.isActive = false;
    await this.avatarRepository.save(avatar);

    this.logger.log(
      `Avatar with id ${avatarId} deleted successfully for user ${user.id}`
    );
  }
}
