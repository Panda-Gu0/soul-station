import { Module } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultations } from './entities/consultation.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [ConsultationController],
  imports: [TypeOrmModule.forFeature([Consultations, User]), UserModule],
  providers: [ConsultationService],
})
export class ConsultationModule {}
