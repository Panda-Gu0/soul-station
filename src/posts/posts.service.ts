import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Posts } from './entities/post.entity';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import * as moment from 'moment';
import { FindAllPostsDto } from './dto/findAll-post.dto';
import { UploadService } from 'src/upload/upload.service';
import { Tag } from 'src/tag/entities/tag.entity';
import { Comment } from 'src/comment/entities/comment.entity';

type AllowedField = 'create_time' | 'update_time';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Posts)
    private postRepository: Repository<Posts>,
    private userService: UserService,
    private uploadService: UploadService,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}
  /**
   * 敏感数据过滤
   */
  dataFilter(post: Posts) {
    const filterUser = () => {
      let { password, salt, roles, ...reset } = post.author;
      return reset;
    };
    const filterPost = () => {
      let { author, ...reset } = post;
      return {
        ...reset,
        author: filterUser(),
      };
    };
    const filteredPost = filterPost();
    return filteredPost;
  }

  /**
   * 搜索时间范围
   * @param query - 查询参数对象
   * @param field - 创建时间或更新时间
   */
  getTimeRange(
    query: SelectQueryBuilder<Posts>,
    field: AllowedField,
    startTime: Date | string,
    endTime: Date | string,
  ) {
    if (startTime && endTime) {
      query.andWhere(`post.${field} BETWEEN :startTime AND :endTime`, {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
    }
  }

  /**
   * 新建文章
   * @param username - 用户名
   * @param post - 文章对象
   */
  async create(username: string, post: CreatePostDto) {
    if (!username) {
      throw new HttpException('作者名称不能为空!', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findOne(username);
    const tags = await this.tagRepository.find({
      where: { id: In(post.tags) },
    });
    const newPost = this.postRepository.create({
      ...post,
      author: user,
      tags: tags,
    });
    await this.postRepository.save(newPost);
    // 标签关联文章数量自增
    for (const tag of tags) {
      tag.postCount += 1;
      await this.tagRepository.save(tag);
      newPost.tags = tags;
    }
    return this.dataFilter(newPost);
  }

  /**
   * 查找单篇文章
   * @param postId - 文章Id
   * @param isDetail - 是否查看详情(判断阅读量的增加)
   */
  async findOne(postId: number, isDetail: boolean) {
    if (!postId) {
      throw new HttpException('文章id不能为空!', HttpStatus.NOT_FOUND);
    }
    let relations = ['author', 'tags', 'comments'];
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: relations, // 关联查询
    });
    if (!post) {
      throw new HttpException('该文章不存在', HttpStatus.NOT_FOUND);
    }
    if (isDetail) {
      post.readingCount += 1; // 增加阅读量
      for (const tag of post.tags) {
        // 增加标签点击量
        tag.clickCount += 1;
        await this.tagRepository.save(tag);
      }
      await this.postRepository.save(post);
    }
    return this.dataFilter(post);
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
          data: '文章封面修改成功',
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
    const {
      page = 1,
      pageSize = 10,
      startCreateTime,
      endCreateTime,
      username,
      startUpdateTime,
      endUpdateTime,
      tagIds,
      ...queryConditions
    } = options;
    // 分页处理
    const query = this.postRepository
      .createQueryBuilder('post')
      .innerJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.comments', 'comment')
      .innerJoin('author.posts', 'author_posts') // 关联用户的文章
      .where((qb) => {
        this.getTimeRange(qb, 'create_time', startCreateTime, endCreateTime);
        this.getTimeRange(qb, 'update_time', startUpdateTime, endUpdateTime);
        if (username) {
          qb.andWhere('author.username LIKE :username', {
            username: `%${username}%`,
          }); // 添加根据用户名的查询条件
        }
        // 多个标签筛选文章
        if (tagIds && tagIds.length > 0) {
          for (let i = 0; i < tagIds.length; i++) {
            qb.andWhere(
              `EXISTS (SELECT 1 FROM post_tag_relation WHERE post_tag_relation.postId = post.id AND post_tag_relation.tagId = :tagId${i})`,
            ).setParameter(`tagId${i}`, tagIds[i]);
          }
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
    const [posts, total] = await Promise.all([
      query.getMany(),
      query.getCount(),
    ]);
    // 过滤敏感数据
    const filteredPosts = posts.map((post) => {
      return this.dataFilter(post);
    });
    return {
      data: filteredPosts,
      total: total,
    };
  }

  /**
   * 修改文章
   * @param updatePost - 更新文章对象(仅允许修改部分字段)
   */
  async update(updatePost: UpdatePostDto) {
    const post = await this.findOne(updatePost.id, false);
    try {
      updatePost.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss'));
      const updateObject = {
        title: updatePost.title,
        content: updatePost.content,
        update_time: updatePost.update_time,
      };
      if (updatePost.tags) {
        const updatedTags = await this.tagRepository.find({
          where: { id: In(updatePost.tags) },
        });
        // 取消旧标签
        for (const tag of post.tags) {
          tag.postCount -= 1;
          await this.tagRepository.save(tag);
        }
        // 更新文章的标签
        post.tags = updatedTags;
        for (const tag of updatedTags) {
          tag.postCount += 1;
          await this.tagRepository.save(tag);
        }
      } else {
        post.tags = [];
      }
      post.title = updateObject.title;
      post.content = updateObject.content;
      post.update_time = updateObject.update_time;
      // 保存文章及其标签的更新
      await this.postRepository.save(post);
      return {
        data: '文章修改成功',
      };
    } catch (err) {
      console.log(err);
      throw new HttpException('文章修改失败', HttpStatus.BAD_REQUEST);
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
    return '操作成功';
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
    return '操作成功';
  }

  /**
   * 删除文章
   * @param postId - 文章Id
   */
  async deletePost(postId: number) {
    const post = await this.findOne(postId, false);
    const comments = post.comments;

    try {
      // 删除与文章相关的评论
      await Promise.all(
        comments.map(async (comment) => {
          await this.commentRepository.delete(comment.id);
        }),
      );

      // 更新与文章相关的标签的 postCount
      const tags = post.tags;
      for (const tag of tags) {
        tag.postCount -= 1;
        await this.tagRepository.save(tag);
      }

      // 最后删除文章本身
      await this.postRepository.delete(post.id);

      return {
        data: '文章删除成功',
      };
    } catch (err) {
      console.log(err);
      throw new HttpException('文章删除失败', HttpStatus.BAD_REQUEST);
    }
  }
}
