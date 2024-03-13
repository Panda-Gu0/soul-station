import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consultations } from './entities/consultation.entity';
import { UserService } from 'src/user/user.service';
import * as moment from 'moment';
import { User } from 'src/user/entities/user.entity';
import { FindAllConsultationDto } from './dto/findAll-consultation.dto';

@Injectable()
export class ConsultationService {
  constructor(
    @InjectRepository(Consultations)
    private consultationRepository: Repository<Consultations>,
    private userService: UserService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  judgeIsCounselor(counselor: any) {
    let isCounselor = false;
    counselor.roles.forEach((e: any) => {
      if (e.id == '4') {
        isCounselor = true;
      }
    });
    return isCounselor;
  }

  /**
   * 创建心理咨询订单
   * @param username - 普通用户名
   * @param counselorName - 心理咨询师用户名
   */
  async create(username: string, counselorName: string) {
    if (!username || !counselorName) {
      throw new HttpException('用户名不能为空!', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findOne(username);
    const counselor = await this.userService.findOne(counselorName);
    // 判断订单接收者是否为心理咨询师
    if (!this.judgeIsCounselor(counselor)) {
      throw new HttpException(
        '订单接收者只能是心理咨询师!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const newConsultation = this.consultationRepository.create({
      user,
      counselor,
    });
    return await this.consultationRepository.save(newConsultation);
  }

  /**
   * 查询单条订单
   * @param orderId - 订单id
   */
  async findOne(orderId: number) {
    if (!orderId) {
      throw new HttpException('咨询订单id不能为空', HttpStatus.NOT_FOUND);
    }
    let relations = ['user'];
    const order = await this.consultationRepository.findOne({
      where: { id: orderId },
      relations, // 关联查询
    });
    if (!order) {
      throw new HttpException('该订单不存在', HttpStatus.NOT_FOUND);
    }
    return order;
  }

  /**
   * 用户结束咨询服务
   * @param orderId - 订单id
   * @param username - 订单创建者用户名
   */
  async completeTask(orderId: number, username: string) {
    if (!orderId) {
      throw new HttpException('咨询订单id不能为空', HttpStatus.NOT_FOUND);
    }
    const order = await this.findOne(orderId);
    const user = await this.userService.findOne(username);
    // 判断订单接收者是否为心理咨询师
    if (this.judgeIsCounselor(user)) {
      throw new HttpException(
        '咨询服务结束只能由用户发起!',
        HttpStatus.BAD_REQUEST,
      );
    }
    order.status = '2';
    order.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss'));
    await this.consultationRepository.save(order);
    // 心理咨询师数据更新
    // const counselor = order.counselor;
    // counselor.serviceCount++;
    // await this.userRepository.save(counselor);
  }

  /**
   * 查询所有心理咨询订单
   * @param options - 查询参数
   */
  async findAll(options: FindAllConsultationDto) {
    const { username, counselorName } = options;
    const query = this.consultationRepository
      .createQueryBuilder('consultation')
      .leftJoinAndSelect('consultation.user', 'user')
      .leftJoinAndSelect('consultation.counselor', 'counselor');
    if (username) {
      query.andWhere('user.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    if (counselorName) {
      query.andWhere('counselor.username LIKE :counselorName', {
        counselorName: `%${counselorName}%`,
      });
    }
    const consultations = await query.getMany();
    return consultations;
  }
}
