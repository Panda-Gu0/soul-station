import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Posts } from '../../posts/entities/post.entity';

@Entity('tag')
export class Tag {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50 })
    name: string;

    @ManyToMany(() => Posts, (post) => post.tags)
    posts: Posts[];

    @Column({ type: 'int', default: 0, name: 'post_count' })
    postCount: number; // 关联文章数量

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    create_time: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    update_time: Date;
}