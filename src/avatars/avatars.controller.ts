import {
  Controller,
  UseGuards,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvatarsService } from './avatars.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';
import { User } from '../decorators/user.decorator';
import { CurrentUser } from '../users/interfaces/current-user.interface';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { AvatarResponseDto } from './dto/avatar-response.dto';
import { toAvatarResponseDto } from './utils/avatar-mapper.utils';

@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @User() user: CurrentUser,
    @UploadedFile(FileValidationPipe) file: IUploadedMulterFile
  ): Promise<AvatarResponseDto> {
    const avatar = await this.avatarsService.uploadAvatar(user.id, file);
    return toAvatarResponseDto(avatar);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteAvatar(
    @User() user: CurrentUser,
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    return this.avatarsService.deleteAvatar(user.id, id);
  }
}
