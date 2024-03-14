import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { UploadService } from 'src/upload/upload.service';
import { TagModule } from 'src/tag/tag.module';
import { Tag } from 'src/tag/entities/tag.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Module({
  controllers: [PostsController],
  imports: [
    TypeOrmModule.forFeature([Posts, User, Tag, Comment]),
    UserModule,
    TagModule,
  ],
  providers: [PostsService, UploadService],
  exports: [PostsService],
})
export class PostsModule {}
