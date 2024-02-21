import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { UserModule } from 'src/user/user.module';
import { TagModule } from 'src/tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Posts } from 'src/posts/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { PostsService } from 'src/posts/posts.service';
import { PostsModule } from 'src/posts/posts.module';

@Module({
  controllers: [CommentController],
  imports: [TypeOrmModule.forFeature([Comment, Posts, User]), UserModule, PostsModule],
  providers: [CommentService],
  exports: [CommentService]
})
export class CommentModule { }
