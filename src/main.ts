import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception/http-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform/transform.interceptor';
import * as session from 'express-session';
import { ValidationPipe } from './utils/validator-pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter()); // 注册异常处理器
  app.useGlobalInterceptors(new TransformInterceptor()); // 注册格式化拦截器
  app.use(
    session({
      secret: 'pandaguo', // 加密
      rolling: true,  // 每次请求添加cookie
      name: 'pandaguo-ssid', // 存在浏览器cookie中的key
      cookie: { maxAge: null }, // 过期时间 ms 
    }),
  );
  app.useGlobalPipes(new ValidationPipe);
  await app.listen(3000);
}
bootstrap();
