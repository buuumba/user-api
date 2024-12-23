import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Avatar } from "./avatar.entity";
import { User } from "../user/user.entity";
import { IFileService } from "src/providers/files/files.adapter";
import { IUploadedMulterFile } from "src/providers/files/s3/interfaces/upload-file.interface";

@Injectable()
export class AvatarService {
  constructor(
    @InjectRepository(Avatar)
    private readonly avatarRepository: Repository<Avatar>,
    private readonly fileService: IFileService,
  ) {}

  /**
   * Загрузка аватара пользователя.
   */
  async uploadAvatar(
    user: User,
    file: IUploadedMulterFile,
    accountId: string,
  ): Promise<Avatar> {
    // Генерация уникального имени файла
    const fileName = `${Date.now()}-${file.originalname}`;

    // Загрузка файла через fileService
    const { path } = await this.fileService.uploadFile({
      userId: user.id,
      fileBuffer: file.buffer,
      fileName,
      accountId,
    });

    // Создание записи аватара в базе данных
    const avatar = this.avatarRepository.create({
      filename: path, // Путь или имя файла
      user,
      isActive: true,
    });

    await this.avatarRepository.save(avatar);

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
      throw new NotFoundException("Avatar not found or already deleted.");
    }

    // Удаление файла через fileService
    await this.fileService.removeFile({ path: avatar.filename });

    // Пометка аватара как неактивного (soft delete)
    avatar.isActive = false;
    await this.avatarRepository.save(avatar);
  }
}
