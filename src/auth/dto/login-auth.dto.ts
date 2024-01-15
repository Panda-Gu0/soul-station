import { IsNotEmpty, IsString } from "class-validator";

export class LoginAuthDto {
    @IsString()
    @IsNotEmpty({
        message: "用户名不能为空"
    })
    username: string;

    @IsString()
    @IsNotEmpty({
        message: "密码不能为空"
    })
    password: string;

    @IsString()
    @IsNotEmpty({
        message: "验证码不能为空"
    })
    code: string; // 验证码
}
