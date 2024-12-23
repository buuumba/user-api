export class UploadFileDto {
  userId: number;
  fileBuffer: Buffer;
  fileName: string;
  accountId: string;
}
