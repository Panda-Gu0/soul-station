import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { ApiException } from 'src/common/filter/http-exception/api.exception';
import { ApiErrorCode } from 'src/common/enums/api-error-code.enum';
import { Role } from 'src/role/entities/role.entity';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as moment from 'moment';
import { UploadService } from 'src/upload/upload.service';
import { ResetPwdDto } from './dto/reset-pwd.dto';
import * as crypto from 'crypto';
import encry from '../utils/crypto';

type AllowedField = 'create_time' | 'update_time';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private uploadService: UploadService,
  ) {}
  /**
   * 搜索时间范围
   * @param query - 查询参数对象
   * @param field - 创建时间或更新时间
   */
  getTimeRange(
    query: SelectQueryBuilder<User>,
    field: AllowedField,
    startTime: Date | string,
    endTime: Date | string,
  ) {
    if (startTime && endTime) {
      query.andWhere(`user.${field} BETWEEN :startTime AND :endTime`, {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      });
    }
  }

  /**
   * 用户注册
   * @param createUser - 用户对象
   */
  async create(createUser: CreateUserDto) {
    const { username, password, nickname, email, roleIds, gender } = createUser;
    const existUser = await this.userRepository.findOne({
      where: { username },
    });
    if (existUser) {
      throw new ApiException(
        '该用户名已存在,请重新输入',
        ApiErrorCode.USER_EXIST,
      );
    }
    try {
      // 查询数组 roleIds 对应所有 role 的实例
      const roles = await this.roleRepository.find({
        where: {
          id: In(roleIds),
        },
      });
      const newUser = await this.userRepository.create({
        username,
        password,
        nickname,
        gender,
        email,
        roles,
      });
      await this.userRepository.save(newUser);
      return {
        data: '注册成功',
      };
    } catch (err) {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 查询单个用户
   * @param username - 用户名
   */
  async findOne(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    if (!user) {
      throw new ApiException('该用户不存在', ApiErrorCode.USER_NOTEXIST);
    }
    if (user.deleted) {
      throw new HttpException(
        '操作失败: 该用户已被删除,请联系管理员',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  /**
   * 查询所有用户
   * @param options - 查询参数
   */
  async findAll(options: FindAllUserDto) {
    const {
      page = 1,
      pageSize = 10,
      roleId,
      startCreateTime,
      endCreateTime,
      startUpdateTime,
      endUpdateTime,
      ...queryConditions
    } = options;
    // 分页处理
    const query = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role') // 连接并加载关联的角色数据
      .where((qb) => {
        this.getTimeRange(qb, 'create_time', startCreateTime, endCreateTime);
        this.getTimeRange(qb, 'update_time', startUpdateTime, endUpdateTime);
      })
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.create_time', 'DESC');
    if (roleId) {
      query.andWhere('role.id = :roleId', { roleId });
    }
    query.andWhere('user.deleted = :deleted', { deleted: false });
    // 进行模糊查询
    Object.entries(queryConditions).forEach(([key, value]) => {
      if (value) {
        query.andWhere(`user.${key} LIKE :${key}`, { [key]: `%${value}%` });
      }
    });
    const [users, total] = await Promise.all([
      query.getMany(),
      query.getCount(),
    ]);
    // 过滤敏感数据
    const filteredUsers = users.map((user) => {
      const { password, salt, ...rest } = user;
      return rest;
    });
    return {
      data: filteredUsers,
      total: total,
    };
  }

  /**
   * 更新用户信息
   * @param username - 用户名
   * @param updateUser - 更新用户对象(仅允许修改部分字段)
   */
  async update(username: string, updateUser: UpdateUserDto) {
    const user = await this.findOne(username);
    try {
      updateUser.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss')); // 数据库update_time字段更新
      await this.userRepository.update({ username: user.username }, updateUser);
      return {
        data: '用户信息更新成功',
      };
    } catch (err) {
      console.log(err);
      throw new HttpException(
        '用户信息更新失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 上传用户头像
   * @param username - 用户名
   * @param file - 用户头像(仅支持图片)
   */
  async uploadAvatar(username: string, file: Express.Multer.File) {
    const user = await this.findOne(username);
    try {
      const { data: url } = await this.uploadService.create(file);
      if (url) {
        user.avatar = url;
        user.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss')); // 数据库update_time字段更新
        await this.userRepository.save(user);
        return {
          data: '用户头像上传成功',
          url: user.avatar,
        };
      }
    } catch (err) {
      console.log(err);
      throw new HttpException('上传图片失败', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 修改用户密码(管理员专用)
   * @param resetPwdDto - 密码修改用户对象
   */
  async resetPassword(resetPwdDto: ResetPwdDto) {
    const { username, newPassword } = resetPwdDto;
    const user = await this.findOne(username);
    // 重新设置新密码
    const salt = crypto.randomBytes(4).toString('base64');
    const hashedPassword = encry(newPassword, salt);
    user.salt = salt;
    user.password = hashedPassword;
    user.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss')); // 数据库update_time字段更新
    await this.userRepository.save(user);
    return {
      data: '修改密码成功',
    };
  }

  /**
   * 删除用户信息
   * @param username - 用户名
   */
  async delete(username: string) {
    const user = await this.findOne(username);
    user.deleted = true;
    try {
      await this.userRepository.save(user);
    } catch (err) {
      console.log(err);
      throw new HttpException('删除用户失败', HttpStatus.BAD_REQUEST);
    }
    return {
      data: '删除用户成功',
    };
  }

  /**
   * 修改用户角色类型
   * @param newRoleIds - 角色类型id数组
   */
  async updateRole(username: string, newRoleIds: number[]) {
    const user = await this.findOne(username);
    const roles = await this.roleRepository.find({
      where: {
        id: In(newRoleIds),
      },
    });
    user.roles = roles;
    user.update_time = new Date(moment().format('YYYY-MM-DD HH:mm:ss'));
    await this.userRepository.save(user);
    return {
      data: '角色类型修改成功',
    };
  }

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
   * 给心理咨询师评分(前端先调用用户结束订单接口，再调用评分接口)
   * @param graderName - 打分者用户名
   * @param counselorName - 心理咨询师用户名
   */
  async mark(graderName: string, counselorName: string, score: number) {
    const grader = await this.findOne(graderName);
    const counselor = await this.findOne(counselorName);
    if (this.judgeIsCounselor(grader)) {
      throw new HttpException('心理咨询师无法进行打分', HttpStatus.BAD_REQUEST);
    }
    if (!this.judgeIsCounselor(counselor)) {
      throw new HttpException('只能给心理咨询师打分', HttpStatus.BAD_REQUEST);
    }
    counselor.serviceCount++;
    await this.userRepository.save(counselor);
    counselor.rate =
      (Number(counselor.rate) * Number(counselor.serviceCount - 1) +
        Number(score)) /
      Number(counselor.serviceCount);
    console.log('serviceCount', counselor.serviceCount);
    console.log('score', score);
    console.log('counselor.rate', counselor.rate);

    await this.userRepository.save(counselor);
    return {
      data: '评分成功',
    };
  }

  test(testParams) {
    return testParams;
  }

  async findPermissionNames(token: string, userInfo) {
    const user = await this.userRepository.findOne({
      where: { username: userInfo.username },
      relations: ['roles', 'roles.permissions'],
    });
    if (user) {
      const permissions = user.roles.flatMap((role) => role.permissions);
      const permissionNames = permissions.map((item) => item.name);
      return [...new Set(permissionNames)];
    } else {
      return [];
    }
  }
}
