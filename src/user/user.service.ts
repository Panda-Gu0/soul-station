import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { ApiException } from 'src/common/filter/http-exception/api.exception';
import { ApiErrorCode } from 'src/common/enums/api-error-code.enum';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>
  ) { }
  /**
   * 用户注册
   * @param createUser 
   */
  async create(createUser: CreateUserDto) {
    const { username, password, nickname, email, roleIds } = createUser
    const existUser = await this.userRepository.findOne({ where: { username } });
    if (existUser) {
      throw new ApiException("该用户名已存在,请重新输入", ApiErrorCode.USER_EXIST);
    }
    if(!roleIds) {
      throw new HttpException("角色类型不能为空", HttpStatus.UNAUTHORIZED);
    }
    try {
      // 查询数组 roleIds 对应所有 role 的实例
      const roles = await this.roleRepository.find({
        where: {
          id: In(roleIds)
        }
      })
      const newUser = await this.userRepository.create({
        username,
        password,
        nickname,
        email,
        roles
      });
      await this.userRepository.save(newUser);
      return "注册成功";
    } catch (err) {
      throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * 查询单个用户
   */
  async findOne(username: string) {
    const user = await this.userRepository.findOne({
      where: { username }
    });
    if (!user) {
      throw new HttpException("该用户不存在", HttpStatus.BAD_REQUEST);
    }
    return user;
  }
  /**
   * 查询所有用户
   * @param page 页码，默认值：1
   * @param pageSize 每页显示数量，默认值：10
   */
  async findAll(page: number = 1, pageSize: number = 10, username?: string, nickname?: string, email?: string) {
    const query = this.userRepository.createQueryBuilder("user")
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy("user.create_time", "DESC")
    // 模糊查询
    if (username) {
      query.andWhere("user.username LIKE :username", { username: `%${username}%` });
    }
    if (nickname) {
      query.andWhere('user.nickname LIKE :nickname', { nickname: `%${nickname}%` });
    }
    if (email) {
      query.andWhere('user.email LIKE :email', { email: `%${email}%` });
    }
    const users = await query.getMany();
    return users;
  }

  test(testParams) {
    return testParams;
  }

  async findPermissionNames(token: string, userInfo) {
    const user = await this.userRepository.findOne({
      where: { username: userInfo.username },
      relations: ["roles", "roles.permissions"],
    });
    if (user) {
      const permissions = user.roles.flatMap(role => role.permissions);
      const permissionNames = permissions.map(item => item.name);
      return [... new Set(permissionNames)];
    } else {
      return [];
    }
  }
}
