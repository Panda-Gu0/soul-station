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
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Public } from 'src/public/public.decorator';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}
  @Public()
  @Post('create')
  async create(@Body() message: CreateMessageDto) {
    return this.messageService.create(message);
  }

  @Public()
  @Get()
  async findAll(@Query('orderId') orderId: number) {
    return this.messageService.findAll(orderId);
  }
}
