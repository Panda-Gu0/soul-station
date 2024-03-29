import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsNotEmpty({
    message: '文章Id不能为空',
  })
  @IsNumber(
    {},
    {
      message: '文章Id必须为number类型',
    },
  )
  id: number;

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
  cover_url?: string;

  update_time: Date;

  @IsOptional()
  tags?: number[];
}
