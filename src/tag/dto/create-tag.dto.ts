import { IsNotEmpty, IsString } from "class-validator";

export class CreateTagDto {
    @IsString({
        message: "标签名必须为string类型"
    })
    @IsNotEmpty({
        message: "标签名不能为空"
    })
    name: string;
}
