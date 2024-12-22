import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Avatar } from "./avatar.entity";
import { AvatarService } from "./avatar.service";
import { AvatarController } from "./avatar.controller";
import { AvatarService } from "./avatar.service";

@Module({
  imports: [TypeOrmModule.forFeature([Avatar])],
  providers: [AvatarService],
  controllers: [AvatarController],
})
export class AvatarModule {}
