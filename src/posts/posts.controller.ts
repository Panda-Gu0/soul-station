import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Public } from 'src/public/public.decorator';
import { FindAllPostsDto } from './dto/findAll-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/utils/multer-config';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }
  @Public()
  @Post('create')
  async create(
    @Query('username') username: string,
    @Body() post: CreatePostDto,
  ) {
    return await this.postsService.create(username, post);
  }

  @Public()
  @Get('detail')
  async getDetail(@Query('postId') postId: number) {
    return await this.postsService.findOne(postId, true);
  }

  @Public()
  @Get()
  async findAll(@Query() options: FindAllPostsDto) {
    const posts = await this.postsService.findAll(options);
    return posts;
  }

  @Public()
  @Post('uploadCover')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadAvatar(
    @Query('postId') postId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.postsService.uploadCover(postId, file);
  }

  @Public()
  @Post('like')
  async likePost(@Query('postId') postId: number) {
    return await this.postsService.likePost(postId);
  }

  @Public()
  @Post('dislike')
  async dislikePost(@Query('postId') postId: number) {
    return await this.postsService.dislikePost(postId);
  }

  @Public()
  @Put('update')
  async update( @Body() updateUser: UpdatePostDto) {
    return this.postsService.update(updateUser);
  }

  @Public()
  @Delete('delete')
  remove(@Query('postId') postId: number) {
    return this.postsService.deletePost(postId);
  }
}
