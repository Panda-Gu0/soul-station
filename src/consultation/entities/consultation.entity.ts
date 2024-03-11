import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('consultation')
export class Consultations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    nullable: false,
    enum: ['1', '2'], // 咨询状态(1：处理中，2：已完成)
    default: '1',
  })
  status: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User; // 订单创建者(普通用户)

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'counselor_id' })
  counselor: User; // 订单接收者(心理咨询师)

  @OneToMany(() => Message, (message) => message.consultation)
  message: Message[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;
}
