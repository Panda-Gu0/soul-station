import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public, Permissions } from 'src/public/public.decorator';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../utils/multer-config';
import { ResetPwdDto } from './dto/reset-pwd.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Public()
  @Get()
  async findAll(@Query() options: FindAllUserDto) {
    const users = await this.userService.findAll(options);
    return users;
  }

  @Put('update')
  async update(
    @Query('username') username: string,
    @Body() updateUser: UpdateUserDto,
  ) {
    return this.userService.update(username, updateUser);
  }

  @Public()
  @Put('updateRole')
  async upateRole(
    @Query('username') username: string,
    @Body() { newRoleIds }: { newRoleIds: number[] },
  ) {
    return this.userService.updateRole(username, newRoleIds);
  }

  @Post('uploadAvatar')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadAvatar(
    @Query('username') username: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadAvatar(username, file);
  }

  @Delete('delete')
  remove(@Query('username') username: string) {
    return this.userService.delete(username);
  }

  @Public()
  @Post('rate')
  async mark(
    @Query('graderName') graderName: string,
    @Query('counselorName') counselorName: string,
    @Query('score') score: number,
  ) {
    return this.userService.mark(graderName, counselorName, score);
  }

  @Post('test')
  @Permissions('read', 'create')
  test(@Body() testParams) {
    return this.userService.test(testParams);
  }

  @Post('setPwd')
  async resetPassword(@Body() resetPwdDto: ResetPwdDto) {
    return this.userService.resetPassword(resetPwdDto);
  }
}
