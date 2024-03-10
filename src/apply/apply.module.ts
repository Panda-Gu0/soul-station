import { Module } from '@nestjs/common';
import { ApplyService } from './apply.service';
import { ApplyController } from './apply.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Apply } from './entities/apply.entity';
import { UserModule } from 'src/user/user.module';
import { UploadService } from 'src/upload/upload.service';

@Module({
  controllers: [ApplyController],
  imports: [TypeOrmModule.forFeature([Apply, User]), UserModule],
  providers: [ApplyService, UploadService],
})
export class ApplyModule {}
