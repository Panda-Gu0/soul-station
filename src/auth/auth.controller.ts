import { Controller, Post, Body, Get, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Public } from 'src/public/public.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Get("code")
  getCode(@Req() req, @Res() res) {
    return this.authService.getCode(req, res);
  }

  @Public()
  @Post("login")
  login(@Body() loginAuth: LoginAuthDto, @Req() req) {
    return this.authService.login(loginAuth, req);
  }
  
  @Public()
  @Post('/test')
  test() {
    return 1;
  }
}
