import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
    @IsString({
        message: '内容必须为string类型',
    })
    @IsNotEmpty({
        message: '内容不能为空',
    })
    content: string;

    @IsString({
        message: 'username必须为string类型',
    })
    @IsNotEmpty({
        message: 'username不能为空',
    })
    username: string;

    @IsNumber({}, {
        message: 'postId必须为number类型',
    })
    @IsNotEmpty({
        message: 'postId不能为空',
    })
    postId: number;

    @IsNumber({}, {
        message: '父级必须为number类型',
    })
    @IsOptional()
    parentCommentId?: number
}
