import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { Posts } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postRepository: Repository<Posts>,
    private userService: UserService,
  ) {}
  /**
   * 新建文章
   */
  async create(username: string, post: CreatePostDto) {
    const user = await this.userService.findOne(username);
    const newPost = this.postRepository.create({
      ...post,
      author: user,
    });
    await this.postRepository.save(newPost);
    console.log('数据库user', user);
    console.log('post', newPost);
  }

  /**
   * 查找文章
   */
  async findAll() {
    return await this.postRepository.find();
  }
}
