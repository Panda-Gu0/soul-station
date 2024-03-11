import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString({
    message: '内容必须为string类型',
  })
  @IsNotEmpty({
    message: '内容不能为空',
  })
  content: string;

  @IsString({
    message: 'username必须为string类型',
  })
  @IsNotEmpty({
    message: 'username不能为空',
  })
  username: string;

  @IsNumber(
    {},
    {
      message: 'consultationId必须为number类型',
    },
  )
  @IsNotEmpty({
    message: 'consultationId不能为空',
  })
  consultationId: number;
}
