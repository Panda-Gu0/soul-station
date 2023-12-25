import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception/http-exception.filter';
import { TransformInterceptor } from './common/interceptor/transform/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter()); // 注册异常处理器
  app.useGlobalInterceptors(new TransformInterceptor()); // 注册格式化拦截器
  await app.listen(3000);
}
bootstrap();
