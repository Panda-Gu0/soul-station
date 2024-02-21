import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from './entities/tag.entity';
import { Repository } from 'typeorm';
import { FindAllTagsDto } from './dto/findAll-tag.dto';
import * as moment from 'moment';

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
    return {
      data: "新建标签成功"
    }
  }

  /**
   * 查找多标签
   */
  async findAll(options: FindAllTagsDto) {
    const { page = 1, pageSize = 10, name } = options;
    const query = this.tagRepository
      .createQueryBuilder("tag")
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy("tag.create_time", "DESC");
    if (name) {
      query.andWhere('tag.name LIKE :name', { name: `%${name}%` });
    }
    const [tags, count] = await Promise.all([
      query.getMany(),
      query.getCount()
    ]);

    return {
      data: tags,
      total: count
    }
  }

  /**
   * 修改标签
   * @param updateTag - 标签修改对象
   */
  async update(updateTag: UpdateTagDto) {
    const tag = await this.tagRepository.findOne({
      where: { id: updateTag.id },
    });
    if (!tag) {
      throw new HttpException("该标签不存在", HttpStatus.NOT_FOUND);
    }
    try {
      tag.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss'));
      tag.name = updateTag.name;
      await this.tagRepository.save(tag);
      return {
        data: "标签修改成功"
      }
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * 删除标签
   */
  async delete(tagId: number) {
    if (!tagId) {
      throw new HttpException("tagId不能为空", HttpStatus.BAD_REQUEST);
    }
    const tag = await this.tagRepository.findOne({
      where: { id: tagId },
      relations: ["posts"]
    });
    if (!tag) {
      throw new HttpException("该标签不存在", HttpStatus.NOT_FOUND);
    }
    if(tag.posts && tag.posts.length > 0) {
      throw new HttpException("该标签存在关联文章,无法删除", HttpStatus.BAD_REQUEST);
    }
    try {
      await this.tagRepository.delete(tag.id);
      return {
        data: '标签删除成功',
      };
    } catch (err) {
      console.log(err);
      throw new HttpException('标签删除失败', HttpStatus.BAD_REQUEST);
    }
  }
}
