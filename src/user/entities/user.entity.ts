import {
  BeforeInsert,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import encry from '../../utils/crypto';
import * as crypto from 'crypto';
import { Role } from 'src/role/entities/role.entity';
import { Exclude } from 'class-transformer';
import { Posts } from 'src/posts/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { Apply } from 'src/apply/entities/apply.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: number; // id 标记为主键,值自动生成

  @Column({ length: 30 })
  username: string; // 用户名

  @Column({ nullable: true })
  nickname: string; // 昵称

  @Exclude()
  @Column()
  password: string; // 密码

  @Column({
    nullable: true,
    default: false,
  })
  deleted: boolean; // 标记用户是否被删除(true: 已删除，false：未删除)

  @Column({ nullable: true })
  avatar: string; // 头像

  @Column({
    type: 'enum',
    enum: ['0', '1'], // 性别(0: 男性，1： 女性)
    default: '0',
  })
  gender: string;

  @Column({ nullable: true })
  email: string; // 邮箱

  @ManyToMany(() => Role, { eager: true }) // 加载关联角色数据
  @JoinTable({
    name: 'user_role_relation',
  })
  roles: Role[]; // 角色类型

  @Column({ nullable: true })
  solgan: string; // 个性签名(心理咨询师专有)

  @OneToMany(() => Apply, (apply) => apply.user)
  applies: Apply[];

  @OneToMany(() => Posts, (post) => post.author)
  posts: Posts[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Exclude()
  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: true })
  birthday: Date; // 生日

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;

  // 在密码插入数据库之前进行加密
  @BeforeInsert()
  beforeInsert() {
    this.salt = crypto.randomBytes(4).toString('base64');
    this.password = encry(this.password, this.salt);
  }
}
