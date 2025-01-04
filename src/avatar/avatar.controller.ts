import {
  Controller,
  UseGuards,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Request,
  Param,
  BadRequestException,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AvatarService } from "./avatar.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { IUploadedMulterFile } from "src/providers/files/s3/interfaces/upload-file.interface";

@Controller("avatar")
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  /**
   * Загрузка аватара пользователя.
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: IUploadedMulterFile,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    // Передача файла и пользователя в сервис
    return this.avatarService.uploadAvatar(req.user, file, req.user.accountId);
  }

  /**
   * Удаление аватара пользователя.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async deleteAvatar(@Request() req, @Param("id") id: number) {
    return this.avatarService.deleteAvatar(req.user, id);
  }
}
