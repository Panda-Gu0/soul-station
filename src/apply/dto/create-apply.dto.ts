import { IsNotEmpty, IsString } from 'class-validator';

export class CreateApplyDto {
  @IsString({
    message: 'username必须为string类型',
  })
  @IsNotEmpty({
    message: 'username不能为空',
  })
  username: string;
}
