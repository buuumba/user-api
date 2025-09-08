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
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvatarsService } from './avatars.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IUploadedMulterFile } from 'src/providers/files/s3/interfaces/upload-file.interface';
import { User } from '../decorators/user.decorator';
import { CurrentUser } from '../shared/interfaces';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { AvatarResponseDto } from './dto/avatar-response.dto';
import { toAvatarResponseDto } from './utils/avatar-mapper.utils';

@ApiTags('Avatars')
@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Загрузить аватар пользователя',
    description:
      'Загружает изображение-аватар для текущего пользователя. Максимум 5 активных аватаров на пользователя.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файл изображения',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Изображение в формате JPEG или PNG, максимум 10MB',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Аватар успешно загружен',
    type: AvatarResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Неверный формат файла, превышен размер или лимит аватаров',
  })
  @ApiUnauthorizedResponse({
    description: 'Неверные учетные данные',
  })
  @ApiConflictResponse({
    description: 'Превышен лимит активных аватаров (максимум 5)',
  })
  async uploadAvatar(
    @User() user: CurrentUser,
    @UploadedFile(FileValidationPipe) file: IUploadedMulterFile
  ): Promise<AvatarResponseDto> {
    const avatar = await this.avatarsService.uploadAvatar(user.id, file);
    return toAvatarResponseDto(avatar);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить аватар пользователя',
    description: 'Выполняет soft delete аватара текущего пользователя',
  })
  @ApiParam({
    name: 'id',
    description: 'ID аватара для удаления',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Аватар успешно удален',
  })
  @ApiBadRequestResponse({
    description: 'Ошибка при удалении файла',
  })
  @ApiUnauthorizedResponse({
    description: 'Требуется авторизация',
  })
  @ApiNotFoundResponse({
    description: 'Аватар не найден или уже удален',
  })
  async deleteAvatar(
    @User() user: CurrentUser,
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    return this.avatarsService.deleteAvatar(user.id, id);
  }
}
