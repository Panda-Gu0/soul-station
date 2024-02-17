import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [PostsController],
  imports: [TypeOrmModule.forFeature([Posts, User]), UserModule],
  providers: [PostsService],
})
export class PostsModule {}
