import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Posts } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postRepository: Repository<Posts>,
  ) {}
  /**
   * 新建文章
   */
  async create(username: string, post: CreatePostDto) {
    const newPost = this.postRepository.create({
      ...post,
    })
    // await this.postRepository.save(newPost);
    console.log('user'); 
    
  }

  /**
   * 查找用户
   */
  async findAll() {
    return await this.postRepository.find();
  }
}
