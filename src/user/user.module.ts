import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Role } from 'src/role/entities/role.entity';
import { UploadService } from 'src/upload/upload.service';
import { Posts } from 'src/posts/entities/post.entity';
import { Consultations } from 'src/consultation/entities/consultation.entity';

@Module({
  controllers: [UserController],
  providers: [UserService, UploadService],
  imports: [
    TypeOrmModule.forFeature([User, Role, Posts, Consultations]),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  exports: [UserService],
})
export class UserModule {}
