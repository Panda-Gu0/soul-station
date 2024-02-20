import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateTagDto {
    @IsString({
        message: "标签名必须为string类型"
    })
    @IsNotEmpty({
        message: "标签名不能为空"
    })
    name: string;

    @IsNumber({}, {
        message: "id必须为number类型"
    })
    @IsNotEmpty({
        message: "id不能为空"
    })
    id: number;
}
