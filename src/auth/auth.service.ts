import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import encry from '../utils/crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}
  /**
   * 用户登录
   * @param loginAuth 
   */
  async login(loginAuth: LoginAuthDto) {
    const { username, password } = loginAuth;
    const user = await this.userService.findOne(username);
    if(user?.password !== encry(password, user.salt)) {
      throw new HttpException("密码错误", HttpStatus.UNAUTHORIZED);
    }
    const payload = { username: user.username, sub: user.id };
    return await this.jwtService.signAsync(payload);
  }
}
