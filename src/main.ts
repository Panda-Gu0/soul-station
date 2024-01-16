import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception/http-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform/transform.interceptor';
import * as session from 'express-session';
import { ValidationPipe } from './utils/validator-pipe';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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
  app.useGlobalPipes(new ValidationPipe); // 全局设置入参校验
  app.useStaticAssets("uploads", { // 设置静态资源路径与访问前缀
    prefix: "/static/"
  });
  await app.listen(3000);
}
bootstrap();
