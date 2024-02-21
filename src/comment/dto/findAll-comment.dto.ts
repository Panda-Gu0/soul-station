import {
  IsNumber,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class FindAllCommentsDto {
    @IsOptional()
    page?: number;
  
    @IsOptional()
    pageSize?: number;

    @IsOptional()
    @IsString({
      message: '文章标题必须为string类型',
    })
    title?: string

    @IsOptional()
    postId?: number | string
  
    @IsString({
      message: '用户名必须为string类型',
    })
    @IsOptional()
    username?: string;

    @IsOptional()
    startCreateTime?: Date;

    @IsOptional()
    endCreateTime?: Date;
  }
  