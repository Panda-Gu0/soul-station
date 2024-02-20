import {
    IsOptional,
    IsString,
    Matches,
  } from 'class-validator';
  
  export class FindAllPostsDto {
    @IsOptional()
    page?: number;
  
    @IsOptional()
    pageSize?: number;

    @IsOptional()
    title?: string
  
    @IsString({
      message: '用户名必须为string类型',
    })
    @IsOptional()
    username?: string;
  
    @IsString({
      message: '用户昵称必须为string类型',
    })
    @IsOptional()
    nickname?: string;

    @IsOptional()
    startCreateTime?: Date;

    @IsOptional()
    endCreateTime?: Date;

    @IsOptional()
    startUpdateTime?: Date;

    @IsOptional()
    endUpdateTime?: Date;

    @IsOptional()
    @Matches(/^\[\d+(, \d+)*\]$/, { message: 'tagIds格式错误' })
    tagIds?: string;
  }
  