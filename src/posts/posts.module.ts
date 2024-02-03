import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './entities/post.entity';

@Module({
  controllers: [PostsController],
  imports: [
    TypeOrmModule.forFeature([Posts]),
  ],
  providers: [PostsService],
})
export class PostsModule {}
