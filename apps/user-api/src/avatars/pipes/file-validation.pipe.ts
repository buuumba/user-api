import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { IUploadedMulterFile } from '../providers/files/s3/interfaces/upload-file.interface';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png'];

  transform(file: IUploadedMulterFile): IUploadedMulterFile {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('File must be JPEG or PNG format');
    }

    if (file.size > this.maxSizeInBytes) {
      throw new BadRequestException('File size must not exceed 10MB');
    }

    return file;
  }
}
