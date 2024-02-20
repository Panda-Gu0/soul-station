import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Public } from 'src/public/public.decorator';
import { FindAllTagsDto } from './dto/findAll-tag.dto';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Public()
  @Post('create')
  async create(@Body() tag: CreateTagDto) {
    return await this.tagService.create(tag);
  }

  @Public()
  @Get()
  async findAll(@Query() options: FindAllTagsDto) {
    return await this.tagService.findAll(options);
  }

  @Public()
  @Put('update')
  async update( @Body() updateTag: UpdateTagDto) {
    return this.tagService.update(updateTag);
  }

  @Public()
  @Delete('delete')
  remove(@Query('tagId') tagId: number) {
    return this.tagService.delete(tagId);
  }
}
