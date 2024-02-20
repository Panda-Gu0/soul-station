import { IsOptional, IsString } from "class-validator";

export class FindAllTagsDto {
    @IsOptional()
    page?: number;
  
    @IsOptional()
    pageSize?: number;

    @IsString({
        message: "标签名必须为string类型"
    })
    @IsOptional()
    name: string;
}
