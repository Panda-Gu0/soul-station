import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Consultations } from 'src/consultation/entities/consultation.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { ConsultationModule } from 'src/consultation/consultation.module';

@Module({
  controllers: [MessageController],
  imports: [
    TypeOrmModule.forFeature([Message, Consultations, User]),
    UserModule,
    ConsultationModule,
  ],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
