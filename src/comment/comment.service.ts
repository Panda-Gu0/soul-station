import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { UserService } from 'src/user/user.service';
import { PostsService } from 'src/posts/posts.service';
import { FindAllCommentsDto } from './dto/findAll-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private userService: UserService,
    private postsService: PostsService,
  ) {}
  /**
   * 敏感数据过滤
   */
  dataFilter(comment: Comment) {
    const filterUser = (user) => {
      let {
        id,
        password,
        salt,
        roles,
        deleted,
        email,
        birthday,
        create_time,
        update_time,
        ...reset
      } = user;
      return reset;
    };
    const filterComment = (comment) => {
      let { user, replies, ...reset } = comment;
      let filteredReplies = [];
      if (replies && replies.length > 0) {
        filteredReplies = replies.map((reply) => {
          let { user, ...replyReset } = reply;
          return {
            ...replyReset,
            user: filterUser(reply.user),
          };
        });
      }
      return {
        ...reset,
        user: filterUser(comment.user),
        replies: filteredReplies,
      };
    };
    const filteredComment = filterComment(comment);
    return filteredComment;
  }

  /**
   * 搜索时间范围
   * @param query - 查询参数对象
   */
  getTimeRange(
    query: SelectQueryBuilder<Comment>,
    startTime: Date | string,
    endTime: Date | string,
  ) {
    if (startTime && endTime) {
      query.andWhere(`comment.create_time BETWEEN :startTime AND :endTime`, {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
    }
  }

  /**
   * 新建评论
   * @param comment - 评论对象
   */
  async create(comment: CreateCommentDto) {
    const user = await this.userService.findOne(comment.username);
    const post = await this.postsService.findOne(comment.postId, false);
    const parentComment = comment.parentCommentId
      ? await this.findOne(comment.parentCommentId)
      : null;
    console.log('parentComment', parentComment);

    if (parentComment && parentComment.post.id !== comment.postId) {
      throw new HttpException(
        '新评论与父级评论的文章id不一致',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newComment = await this.commentRepository.create({
      content: comment.content,
      user,
      post,
      parentComment,
    });
    await this.commentRepository.save(newComment);
    if (parentComment) {
      parentComment.replies = parentComment.replies || [];
      parentComment.replies.push(newComment);
      await this.commentRepository.save(parentComment);
    }
    console.log('parentComment', parentComment);

    return this.dataFilter(newComment);
  }

  /**
   * 查询单条评论
   */
  async findOne(commentId: number) {
    if (!commentId) {
      throw new HttpException('评论id不能为空', HttpStatus.NOT_FOUND);
    }
    let relations = ['user', 'post', 'replies'];
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations, // 关联查询
    });
    if (!comment) {
      throw new HttpException('该评论不存在', HttpStatus.NOT_FOUND);
    }
    return comment;
  }

  /**
   * 查询具体文章的所有评论
   * @param options - 查询参数(用户名、评论时间、文章id)
   */
  async findAll(options: FindAllCommentsDto) {
    const {
      page = 1,
      pageSize = 10,
      postId,
      username,
      title,
      startCreateTime,
      endCreateTime,
      ...queryConditions
    } = options;
    const query = this.commentRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect('comment.user', 'user')
      .innerJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'replyUser')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .where((qb) => {
        this.getTimeRange(qb, startCreateTime, endCreateTime);
        if (username) {
          qb.andWhere('user.username LIKE :username', {
            username: `%${username}%`,
          }); // 添加根据用户名的查询条件
        }
        if (title) {
          qb.andWhere('post.title LIKE :title', { title: `%${title}%` }); // 添加根据标题的查询条件
        }
      })
      .orderBy('comment.create_time', 'DESC');
    // 如果传入posId,则只返回一级评论,如果没有postId,则返回所有评论(后台系统不分层展示所有评论)
    if (postId) {
      query
        .where('comment.parentComment IS NULL')
        .andWhere('comment.post_id = :postId', { postId });
    }
    const [comments, total] = await Promise.all([
      query.getMany(),
      query.getCount(),
    ]);
    // 过滤敏感数据
    const filteredComments = comments.map((comment) => {
      return this.dataFilter(comment);
    });
    return {
      data: filteredComments,
      total,
    };
  }

  /**
   * 删除评论
   */
  async delete(commentId: number) {
    const comment = await this.findOne(commentId);
    // 如果存在父级评论,则父级评论相关的子评论列表也需要更新
    if (comment.parentComment && comment.parentComment.replies) {
      comment.parentComment.replies = comment.parentComment.replies.filter(
        (reply) => reply.id !== comment.id,
      );
      await this.commentRepository.save(comment.parentComment);
    }
    await this.commentRepository.delete(comment.id);
    return {
      data: '删除评论成功',
    };
  }
}
