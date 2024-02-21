import { Posts } from "src/posts/entities/post.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('comment')
export class Comment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "mediumtext", default: null })
    content: string;

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Posts, (post) => post.comments)
    @JoinColumn({ name: 'post_id' })
    post: Posts;

    @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true }) // 所属父级评论
    @JoinColumn({ name: "parent_comment_id" })
    parentComment: Comment;

    @OneToMany(() => Comment, (comment) => comment.parentComment) // 子评论列表
    replies: Comment[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    create_time: Date;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    update_time: Date;
}
