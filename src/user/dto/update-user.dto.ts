import { IsOptional, IsString, IsIn, IsEmail, IsDate, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsString({
    message: '用户昵称必须为string类型',
  })
  @IsOptional()
  nickname?: string;

  @IsString({
    message: '用户邮箱必须为string类型',
  })
  @IsEmail(
    {},
    {
      message: '请输入正确的邮箱格式',
    },
  )
  @IsOptional()
  email?: string;

  @IsString({
    message: '用户性别必须为string类型',
  })
  @IsIn(['0', '1'], { message: "用户性别只能传入'0'或'1'" })
  @IsOptional()
  gender?: string;

  update_time: Date;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: '生日格式必须为YYYY-MM-DD',
  })
  @IsOptional()
  birthday?: Date
}
