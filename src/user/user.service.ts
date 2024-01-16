import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
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
    const { page = 1, pageSize = 10, ...queryConditions } = options;
    // 分页处理
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.deleted = :deleted', { deleted: false }) // 已删除的用户不展示
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('user.create_time', 'DESC');
    // 进行模糊查询
    Object.entries(queryConditions).forEach(([key, value]) => {
      if (value) {
        query.andWhere(`user.${key} LIKE :${key}`, { [key]: `%${value}%` });
      }
    });
    const users = await query.getMany();
    // 过滤敏感数据
    const filteredUsers = users.map((user) => {
      const { password, salt, ...rest } = user;
      return rest;
    });
    return {
      data: filteredUsers,
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
