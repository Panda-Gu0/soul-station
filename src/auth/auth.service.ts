import { HttpException, HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import encry from '../utils/crypto';
import { plainToClass } from 'class-transformer';
import { User } from 'src/user/entities/user.entity';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  /**
   * 获取图片验证码
   */
  async getCode(@Req() req, @Res() res) {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 4
    });
    req.session.code = captcha.text; // 存储验证码记录到session
    req.session.codeCreateTime = new Date(); // 存储验证码的创建时间
    res.type("image/svg+xml");
    res.send(captcha.data);
  }

  /**
   * 用户登录
   * @param loginAuth
   */
  async login(loginAuth: LoginAuthDto, @Req() req) {
    const { username, password, code } = loginAuth;
    const user = await this.userService.findOne(username);
    if (user?.password !== encry(password, user.salt)) {
      throw new HttpException('密码错误', HttpStatus.UNAUTHORIZED);
    }
    // if(!code) {
    //   return new HttpException("验证码不能为空", HttpStatus.UNAUTHORIZED);
    // } 
    if(code && req.session.code && code.toLowerCase() !== req.session.code.toLowerCase()) {
      return new HttpException("验证码错误", HttpStatus.UNAUTHORIZED);
    }
    // 验证验证码有效时间
    const currentTime = new Date();
    const timeDifference = currentTime.getTime() - new Date(req.session.codeCreateTime).getTime();
    const expirationTime = 60 * 1000; // 设置60S过期时间
    if(timeDifference > expirationTime) {
      delete req.session.code;
      delete req.session.codeCreateTime;
      throw new HttpException("验证码已过期", HttpStatus.UNAUTHORIZED);
    }

    const transformedUser = plainToClass(User, user); // 转换用户对象(过滤掉密码等敏感数据)
    const payload = { username: user.username, sub: user.id };
    const token = await this.jwtService.signAsync(payload);
    return {
      data: token,
      user: transformedUser,
    };
  }
}
