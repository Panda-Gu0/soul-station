import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { UploadModule } from './upload/upload.module';
import { PostsModule } from './posts/posts.module';
import { TagModule } from './tag/tag.module';
import { CommentModule } from './comment/comment.module';
import { ApplyModule } from './apply/apply.module';
import { ConsultationModule } from './consultation/consultation.module';
import { MessageModule } from './message/message.module';
import * as path from 'path';
const isProd = process.env.NODE_ENV == "production";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [isProd ? path.resolve(".env.prod") : path.resolve(".env")]
    }),
    TypeOrmModule.forRoot({ // TypeORM 导入数据库
      type: "mysql",
      synchronize: !isProd, // 是否自动同步实体文件(生产环境建议关闭)
      autoLoadEntities: true, // 自动加载实体
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}']
    }),
    UserModule,
    AuthModule,
    RoleModule,
    PermissionModule,
    UploadModule,
    PostsModule,
    TagModule,
    CommentModule,
    ApplyModule,
    ConsultationModule,
    MessageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
