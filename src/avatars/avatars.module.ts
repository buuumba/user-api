import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Avatar } from './entities/avatars.entity';
import { User } from '../users/entities/user.entity';
import { AvatarsService } from './avatars.service';
import { AvatarsController } from './avatars.controller';
import { FilesModule } from 'src/providers/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Avatar, User]), FilesModule],
  providers: [AvatarsService],
  controllers: [AvatarsController],
})
export class AvatarsModule {}
