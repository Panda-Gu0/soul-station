import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CreateApplyDto } from './dto/create-apply.dto';
import { Apply } from './entities/apply.entity';
import { UserService } from 'src/user/user.service';
import { UploadService } from 'src/upload/upload.service';
import * as moment from 'moment';
import { FindAllAppliesDto } from './dto/findAll-apply.dto';

type AllowedField = 'apply_time' | 'update_time';

@Injectable()
export class ApplyService {
  constructor(
    @InjectRepository(Apply)
    private applyRepository: Repository<Apply>,
    private userService: UserService,
    private uploadService: UploadService,
  ) {}
  /**
   * 搜索时间范围
   * @param query - 查询参数对象
   * @param field - 创建时间或更新时间
   */
  getTimeRange(
    query: SelectQueryBuilder<Apply>,
    field: AllowedField,
    startTime: Date | string,
    endTime: Date | string,
  ) {
    if (startTime && endTime) {
      query.andWhere(`apply.${field} BETWEEN :startTime AND :endTime`, {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
    }
  }

  /** 新建申请 */
  async create(username: string, file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('申请资料不能为空', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.findOne(username);
    let isConsultant = user.roles.some((role) => role.id == '4');
    if (isConsultant) {
      throw new HttpException('该用户已是心理咨询师', HttpStatus.BAD_REQUEST);
    }
    const newApply = this.applyRepository.create({
      user,
      evidenceUrl: '',
    });
    let savedApply = await this.applyRepository.save(newApply);
    await this.uploadEvidence(savedApply.id, file); // 保存图片证明
    return this.findOne(savedApply.id);
  }

  /** 查询单条申请记录 */
  async findOne(applyId: number) {
    if (!applyId) {
      throw new HttpException('申请记录id不能为空', HttpStatus.BAD_REQUEST);
    }
    let relations = ['user'];
    const apply = await this.applyRepository.findOne({
      where: { id: applyId },
      relations,
    });
    if (!apply) {
      throw new HttpException('查无此记录', HttpStatus.NOT_FOUND);
    }
    return apply;
  }

  /** 查看所有申请记录 */
  async findAll(options: FindAllAppliesDto) {
    const {
      page = 1,
      pageSize = 10,
      status,
      username,
      startApplyTime,
      endApplyTime,
      startUpdateTime,
      endUpdateTime,
    } = options;
    const query = this.applyRepository
      .createQueryBuilder('apply')
      .innerJoinAndSelect('apply.user', 'user')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .where((qb) => {
        this.getTimeRange(qb, 'apply_time', startApplyTime, endApplyTime);
        this.getTimeRange(qb, 'update_time', startUpdateTime, endUpdateTime);
        if (username) {
          qb.andWhere('user.username LIKE :username', {
            username: `%${username}%`,
          }); // 添加根据用户名的查询条件
        }
        if (status) {
          qb.andWhere('apply.status = :status', { status });
        }
      })
      .orderBy('apply.apply_time', 'DESC');
    const [applies, total] = await Promise.all([
      query.getMany(),
      query.getCount(),
    ]);
    return {
      data: applies,
      total: total,
    };
  }

  /** 修改申请资料 */
  async uploadEvidence(applyId: number, file: Express.Multer.File) {
    const apply = await this.findOne(Number(applyId));
    try {
      const { data: url } = await this.uploadService.create(file);
      if (url) {
        apply.evidenceUrl = url;
        apply.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss')); // 数据库update_time字段更新
        await this.applyRepository.save(apply);
        return {
          data: '申请资料上传成功',
        };
      }
    } catch (err) {
      console.log(err);
      throw new HttpException('上传失败', HttpStatus.BAD_REQUEST);
    }
  }

  /** 审核通过与拒绝 */
  async audit(applyId: number, isPass: boolean) {
    const apply = await this.findOne(applyId);
    if (isPass) {
      apply.status = '2';
      await this.applyRepository.save(apply);
      await this.userService.updateRole(apply.user.username, [4]);
    } else {
      apply.status = '0';
      await this.applyRepository.save(apply);
    }
    return {
      data: isPass ? '该审核已通过' : '已拒绝该审核',
    };
  }
}
