import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/public/public.decorator';
import { multerConfig } from 'src/utils/multer-config';
import { ApplyService } from './apply.service';
import { CreateApplyDto } from './dto/create-apply.dto';
import { FindAllAppliesDto } from './dto/findAll-apply.dto';

@Controller('apply')
export class ApplyController {
  constructor(private readonly applyService: ApplyService) {}

  @Public()
  @Post('create')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async create(
    @Query('username') username: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applyService.create(username, file);
  }

  @Public()
  @Get()
  async findAll(@Query() options: FindAllAppliesDto) {
    return this.applyService.findAll(options);
  }

  @Public()
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(
    @Query('applyId') applyId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.applyService.uploadEvidence(applyId, file);
  }

  @Public()
  @Post('audit')
  async audit(
    @Query('applyId') applyId: number,
    @Body() { isPass }: { isPass: boolean },
  ) {
    return this.applyService.audit(applyId, isPass);
  }
}
