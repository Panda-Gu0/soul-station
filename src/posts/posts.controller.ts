import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Public } from 'src/public/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }
  @Public()
  @Post('create')
  async create(@Query() username: string, @Body() post: CreatePostDto) {
    return await this.postsService.create(username, post);
  }

  @Public()
  @Get()
  async findAll() {
    return await this.postsService.findAll();
  }
}
