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
import { diskStorage } from "multer";
import * as path from "path";

@Controller("avatar")
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads", // Локальная папка для хранения
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // Ограничение: 10 MB
    }),
  )
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }
    return this.avatarService.uploadAvatar(req.user, file.filename);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async deleteAvatar(@Request() req, @Param("id") id: number) {
    return this.avatarService.deleteAvatar(req.user, id);
  }
}
