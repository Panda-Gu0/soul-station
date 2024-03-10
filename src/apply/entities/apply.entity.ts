import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('apply')
export class Apply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    nullable: false,
    enum: ['0', '1', '2'], // 审核状态(0：拒绝，1：审核中，2：审核通过)
    default: '1',
  })
  status: string;

  @Column()
  evidenceUrl: string; // 证明资料

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  apply_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
