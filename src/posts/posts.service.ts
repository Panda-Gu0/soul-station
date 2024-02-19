import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Posts } from './entities/post.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import * as moment from 'moment';
import { FindAllPostsDto } from './dto/findAll-post.dto';
import { UploadService } from 'src/upload/upload.service';

type AllowedField = "create_time" | "update_time";

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postRepository: Repository<Posts>,
    private userService: UserService,
    private uploadService: UploadService,
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
   * 搜索时间范围
   * @param query - 查询参数对象
   * @param field - 创建时间或更新时间
   */
  getTimeRange(query: SelectQueryBuilder<Posts>, field: AllowedField, startTime: Date | string, endTime: Date | string) {
    if (startTime && endTime) {
      query.andWhere(`post.${field} BETWEEN :startTime AND :endTime`, {
        startTime: new Date(startTime),
        endTime: new Date(endTime)
      });
    }
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
   * 修改文章封面
   */
  async uploadCover(postId: number, file: Express.Multer.File) {
    const post = await this.findOne(postId, false);
    try {
      const { data: url } = await this.uploadService.create(file);
      if (url) {
        post.coverUrl = url;
        post.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss')); // 数据库update_time字段更新
        await this.postRepository.save(post);
        return {
          data: '文章封面修改成功'
        };
      }
    } catch (err) {
      console.log(err);
      throw new HttpException('上传图片失败', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 查询所有文章
   * @param options - 查询参数
   */
  async findAll(options: FindAllPostsDto) {
    const { page = 1, pageSize = 10, startCreateTime, endCreateTime, username, startUpdateTime, endUpdateTime, ...queryConditions } = options;
    // 分页处理
    const query = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.author', 'author')
      .innerJoin('author.posts', 'author_posts') // 关联用户的文章
      .where((qb) => {
        this.getTimeRange(qb, "create_time", startCreateTime, endCreateTime);
        this.getTimeRange(qb, "update_time", startUpdateTime, endUpdateTime);
        if (username) {
          qb.andWhere('author.username = :username', { username }); // 添加根据用户名的查询条件
        }
      })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('post.create_time', 'DESC');
    // 进行模糊查询
    Object.entries(queryConditions).forEach(([key, value]) => {
      if (value) {
        query.andWhere(`post.${key} LIKE :${key}`, { [key]: `%${value}%` });
      }
    });
    // 计算总条数
    const totalQuery = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.author', 'author')
      .innerJoin('author.posts', 'author_posts') // 关联用户的文章
      .where((qb) => {
        this.getTimeRange(qb, "create_time", startCreateTime, endCreateTime);
        this.getTimeRange(qb, "update_time", startUpdateTime, endUpdateTime);
        if (username) {
          qb.andWhere('author.username = :username', { username }); // 添加根据用户名的查询条件
        }
      })
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
      return this.dataFormat(post);
    });
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
   * @param postId - 文章Id
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
   * @param postId - 文章Id
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
   * @param postId - 文章Id
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
