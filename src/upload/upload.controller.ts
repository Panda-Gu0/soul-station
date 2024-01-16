import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../utils/multer-config';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post()
  @UseInterceptors(FileInterceptor("file", multerConfig))
  upload(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.create(file);
  }
}
