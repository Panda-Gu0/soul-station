import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Query,
  Put
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Public, Permissions } from 'src/public/public.decorator';
import { FindAllUserDto } from './dto/findAll-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Public()
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

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

  @Delete('delete')
  remove(@Query('username') username: string) {
    return this.userService.delete(username);
  }

  @Post('test')
  @Permissions('read', 'create')
  test(@Body() testParams) {
    return this.userService.test(testParams);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
