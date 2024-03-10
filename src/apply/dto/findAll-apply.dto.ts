import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindAllAppliesDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  pageSize?: number;

  @IsOptional()
  applyId?: number | string;

  @IsString({
    message: '用户名必须为string类型',
  })
  @IsOptional()
  username?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  startApplyTime?: Date;

  @IsOptional()
  endApplyTime?: Date;

  @IsOptional()
  startUpdateTime?: Date;

  @IsOptional()
  endUpdateTime?: Date;
}
