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

  @OneToMany(() => Posts, (post) => post.author)
  posts: Posts[];

  @Exclude()
  @Column({ nullable: true })
  salt: string;
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
