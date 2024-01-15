import { IsOptional, IsString } from "class-validator";

export class FindAllUserDto {
    @IsOptional()
    page?: number;

    @IsOptional()
    pageSize?: number;

    @IsString({
        message: "用户名必须为string类型"
    })
    @IsOptional()
    username?: string;

    @IsString({
        message: "用户昵称必须为string类型"
    })
    @IsOptional()
    nickname?: string;

    @IsString({
        message: "用户性别必须为string类型"
    })
    @IsOptional()
    gender?: string;

    @IsString({
        message: "用户邮箱必须为string类型"
    })
    @IsOptional()
    email?: string;
}
