import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Posts } from './entities/post.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import * as moment from 'moment';
import { FindAllPostsDto } from './dto/findAll-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postRepository: Repository<Posts>,
    private userService: UserService,
  ) { }
  /**
   * 数据格式化
   */
  dataFormat(post: Posts) {
    const filterUser = () => {
      let { password, salt, roles, ...reset } = post.author;
      return reset;
    }
    const filterPost = () => {
      let { author, ...reset } = post;
      return {
        ...reset,
        author: filterUser()
      };
    }
    const filteredPost = filterPost();
    return filteredPost;
  }

  /**
   * 新建文章
   */
  async create(username: string, post: CreatePostDto) {
    if (!username) {
      throw new HttpException("作者名称不能为空!", HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findOne(username);
    const newPost = this.postRepository.create({
      ...post,
      author: user,
    });
    await this.postRepository.save(newPost);
    return this.dataFormat(newPost);
  }

  /**
   * 查找单篇文章
   * @param postId - 文章Id
   * @param isDetail - 是否查看详情(判断阅读量的增加)
   */
  async findOne(postId: number, isDetail: boolean) {
    if (!postId) {
      throw new HttpException("文章id不能为空!", HttpStatus.NOT_FOUND);
    }
    let relations = ['author'];
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: relations // 关联查询
    });
    if (!post) {
      throw new HttpException("该文章不存在", HttpStatus.NOT_FOUND);
    }
    if (isDetail) {
      post.readingCount += 1; // 增加阅读量
      await this.postRepository.save(post);
    }
    return this.dataFormat(post);
  }

  /**
   * 查询所有文章
   * @param options - 查询参数
   */
  async findAll(options: FindAllPostsDto) {
    const { page = 1, pageSize = 10, ...queryConditions } = options;
    // 分页处理
    const query = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.author', 'author')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('post.create_time', 'DESC');
      // 进行模糊查询
      Object.entries(queryConditions).forEach(([key, value]) => {
        if (value) {
          console.log(`post.${key} LIKE :${key}`, { [key]: `%${value}%` });

          query.andWhere(`post.${key} LIKE :${key}`, { [key]: `%${value}%` });
        }
      });
      const totalQuery = this.postRepository.createQueryBuilder('post') // 添加一个新的查询
      // 应用搜索条件到totalQuery
      Object.entries(queryConditions).forEach(([key, value]) => {
        if (value) {
          totalQuery.andWhere(`post.${key} LIKE :${key}`, {
            [key]: `%${value}%`,
          });
        }
      });
      const [posts, total] = await Promise.all([
        query.getMany(),
        totalQuery.getCount(),
      ]);
      // 过滤敏感数据
      const filteredPosts = posts.map((post) => {
        return post;
      });
     console.log(posts);

      return {
        data: filteredPosts,
        total: total,
      };
  }

  /**
   * 修改文章
   * @param postId - 文章Id
   * @param updatePost - 更新文章对象(仅允许修改部分字段)
   */
  async update(updatePost: UpdatePostDto) {
    const post = await this.findOne(updatePost.id, false);
    try {
      updatePost.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss'));
      await this.postRepository.update({ id: post.id }, updatePost);
      return {
        data: "文章修改成功"
      };
    } catch (err) {
      console.log(err);
      throw new HttpException("文章修改失败", HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 文章点赞
   */
  async likePost(postId: number) {
    const post = await this.findOne(postId, false);
    if (post) {
      post.likeCount++;
      await this.postRepository.save(post);
    }
    return "操作成功";
  }

  /**
   * 取消点赞
   */
  async dislikePost(postId: number) {
    const post = await this.findOne(postId, false);
    if (post && post.likeCount > 0) {
      post.likeCount--;
      await this.postRepository.save(post);
    }
    return "操作成功";
  }

  /**
   * 删除文章
   */
  async deletePost(postId: number) {
    const post = await this.findOne(postId, false);
    try {
      await this.postRepository.delete(post.id);
      return {
        data: "文章删除成功"
      };
    } catch (err) {
      console.log(err);
      throw new HttpException("文章删除失败", HttpStatus.BAD_REQUEST);
    }
  }
}
