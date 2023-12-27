import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
      throw new ApiException("该用户名已存在", ApiErrorCode.USER_EXIST);
    }
    try {
      // 查询数组 roleIds 对应所有 role 的实例
      const roles = await this.roleRepository.find({
        where: {
          id: In(roleIds)
        }
      })
      const newUser = await this.userRepository.create(createUser);
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
      throw new HttpException("用户名不存在", HttpStatus.BAD_REQUEST);
    }
    return user;
  }
  // async findAll() {
  //   throw new ApiException("用户不存在", ApiErrorCode.USER_NOTEXIST);
  //   return await this.userRepository.find();
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} user`;
  // }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} user`;
  // }
}
