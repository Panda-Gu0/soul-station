import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Public } from 'src/public/public.decorator';
import { FindAllCommentsDto } from './dto/findAll-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Public()
  @Post('create')
  async create(@Body() comment: CreateCommentDto) {
    return this.commentService.create(comment);
  }

  @Public()
  @Get()
  async findAll(@Query() options: FindAllCommentsDto) {
    return await this.commentService.findAll(options);
  }

  @Public()
  @Delete('delete')
  remove(@Query('commentId') commentId: number) {
    return this.commentService.delete(commentId);
  }
}
