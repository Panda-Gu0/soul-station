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
    const { username, password, roleIds } = createUser
    const existUser = await this.userRepository.findOne({ where: { username } });
    if(existUser) {
      throw new ApiException("该用户名已存在,请重新输入", ApiErrorCode.USER_EXIST);
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
        roles
      });
      await this.userRepository.save(newUser);
      return "注册成功";
    } catch(err) {
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
    if(!user) {
      throw new HttpException("该用户不存在", HttpStatus.BAD_REQUEST);
    }
    return user;
  }
  /**
   * 查询所有用户
   */
  async findAll() {
    const users = await this.userRepository.find();
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
    if(user) {
      const permissions = user.roles.flatMap(role => role.permissions);
      const permissionNames = permissions.map(item => item.name);
      return [... new Set(permissionNames)];
    } else {
      return [];
    }
  }
}
