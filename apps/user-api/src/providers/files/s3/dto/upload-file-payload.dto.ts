import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { IUploadedMulterFile } from "../interfaces/upload-file.interface";

export class UploadFilePayloadDto {
  readonly accountId: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly file: IUploadedMulterFile;

  @ApiProperty({
    example: "/profiles/avatars",
  })
  @IsString()
  @IsNotEmpty()
  readonly folder: string;

  @ApiProperty({
    example: "file-name",
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;
}
