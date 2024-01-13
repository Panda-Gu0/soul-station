import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
// 过滤数据，仅允许修改以下字段
export class UpdateUserDto extends PartialType(PickType(CreateUserDto, ['email', 'nickname'])) { }