import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsultationService } from 'src/consultation/consultation.service';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private userService: UserService,
    private consultationService: ConsultationService,
  ) {}

  /**
   * 用户发送消息
   */
  async create(message: CreateMessageDto) {
    const user = await this.userService.findOne(message.username);
    const consultation = await this.consultationService.findOne(
      message.consultationId,
    );
    if (
      user.username != consultation.user.username &&
      user.username != consultation.counselor.username
    ) {
      throw new HttpException(
        '只能由订单发起者和接收者发送消息',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (consultation.status == '2') {
      throw new HttpException(
        '订单已完成，无法发送信息',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newMessage = await this.messageRepository.create({
      content: message.content,
      user,
      consultation,
    });
    await this.messageRepository.save(newMessage);
    return newMessage;
  }

  /** 根据订单id获取所有消息 */
  async findAll(orderId: number) {
    if (!orderId) {
      throw new HttpException('订单id不能为空', HttpStatus.BAD_REQUEST);
    }
    const query = this.messageRepository
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.user', 'user')
      .innerJoin('message.consultation', 'consultation')
      .innerJoinAndSelect('user.roles', 'role')
      .where('consultation.id = :id', { id: orderId })
      .orderBy('message.create_time', 'ASC');
    return query.getMany();
  }
}
