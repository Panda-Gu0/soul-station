import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { Public } from 'src/public/public.decorator';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';

@Controller('consultation')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}
  @Public()
  @Post('create')
  async create(
    @Query('username') username: string,
    @Query('counselorName') counselorName: string,
  ) {
    return await this.consultationService.create(username, counselorName);
  }

  @Public()
  @Get('findOne')
  async findOne(@Query('orderId') orderId: number) {
    return await this.consultationService.findOne(orderId);
  }

  @Public()
  @Post('completeTask')
  async completeTask(
    @Query('username') username: string,
    @Query('orderId') orderId: number,
  ) {
    return await this.consultationService.completeTask(orderId, username);
  }
}
