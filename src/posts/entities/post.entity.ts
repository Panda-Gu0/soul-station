import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('post')
export class Posts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  title: string;

  @Column({ type: 'mediumtext', default: null })
  content: string;

  @Column({ type: 'mediumtext', default: null, name: 'content_html' })
  contentHtml: string; // content内容转html

  @Column({ default: null, name: 'cover_url' })
  coverUrl: string; // 文章封面图

  @Column({ type: 'int', default: 0, name: 'like_count' })
  likeCount: number; // 点赞量

  @Column({ type: 'int', default: 0, name: 'reading_count' })
  readingCount: number; // 阅读量

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  author: User;
}
