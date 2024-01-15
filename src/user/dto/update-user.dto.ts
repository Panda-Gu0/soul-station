import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {
    @IsString({
        message: "用户昵称必须为string类型"
    })
    @IsOptional()
    nickname?: string;

    @IsString({
        message: "用户邮箱必须为string类型"
    })
    @IsOptional()
    email?: string;

    @IsString({
        message: "用户性别必须为string类型"
    })
    @IsOptional()
    gender?: string;
}
