import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";

export class CreateUserDto {
    @IsString({
        message: "用户名必须为string类型"
    })
    @IsNotEmpty({
        message: "用户名不能为空"
    })
    username: string;

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
        message: "用户密码必须为string类型"
    })
    @IsNotEmpty({
        message: "用户密码不能为空"
    })
    password: string;

    @IsString({
        message: "用户性别必须为string类型"
    })
    @IsIn(["0", "1"], { message: "用户性别只能传入'0'或'1'" })
    @IsOptional()
    gender?: string;

    @IsNotEmpty({
        message: "用户角色类型不能为空"
    })
    roleIds: number[];
}
