import { IsNotEmpty, IsString } from "class-validator";

export class ResetPwdDto {
    @IsString({
        message: "用户名必须为string类型"
    })
    @IsNotEmpty({
        message: "用户名不能为空"
    })
    username: string;

    @IsString({
        message: "密码必须为string类型"
    })
    @IsNotEmpty({
        message: "新密码不能为空"
    })
    newPassword: string;
}