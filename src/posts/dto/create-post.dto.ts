import { IsNotEmpty, IsString } from "class-validator";
import { User } from "src/user/entities/user.entity";

export class CreatePostDto {
    @IsString({
        message: "标题必须为string类型"
    })
    @IsNotEmpty({
        message: "标题不能为空"
    })
    title: string;

    @IsString({
        message: "内容必须为string类型"
    })
    @IsNotEmpty({
        message: "内容不能为空"
    })
    content: string;
    // contentHtml: string;
    // coverUrl: string;
    // likeCount: number;
    // readingCount: number;
    // @IsString({
    //     message: "作者名必须为string类型"
    // })
    // @IsNotEmpty({
    //     message: "作者名不能为空"
    // })
    // author: User;
}
