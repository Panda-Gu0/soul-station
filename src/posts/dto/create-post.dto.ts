import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString({
    message: '标题必须为string类型',
  })
  @IsNotEmpty({
    message: '标题不能为空',
  })
  title: string;

  @IsString({
    message: '内容必须为string类型',
  })
  @IsNotEmpty({
    message: '内容不能为空',
  })
  content: string;

  @IsOptional()
  tags?: number[];
}
