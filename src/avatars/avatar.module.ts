import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Avatar } from "./avatar.entity";
import { AvatarService } from "./avatar.service";
import { AvatarController } from "./avatar.controller";
import { FilesModule } from "src/providers/files/files.module";

@Module({
  imports: [TypeOrmModule.forFeature([Avatar]), FilesModule],
  providers: [AvatarService],
  controllers: [AvatarController],
})
export class AvatarModule {}
