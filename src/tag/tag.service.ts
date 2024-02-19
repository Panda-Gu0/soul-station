import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) { }
  
  /**
   * 新增标签
   */
    async create(tag: CreateTagDto) {
      const newTag = await this.tagRepository.create({
        name: tag.name
      });
      await this.tagRepository.save(newTag);
    }
}
