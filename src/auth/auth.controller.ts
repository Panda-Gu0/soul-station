import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Public } from 'src/public/public.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginAuth: LoginAuthDto) {
    return this.authService.login(loginAuth);
  }
  
  @Public()
  @Post('/test')
  test() {
    return 1;
  }
}
