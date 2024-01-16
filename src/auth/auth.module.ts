import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get("JWT_SECRET"),
          global: true,
          signOptions: {
            expiresIn: "6h"
          }
        }
      }
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
export class AuthModule {}
