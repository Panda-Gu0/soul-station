export class CreateUserDto {
    username: string;
    nickname: string;
    email: string;
    password: string;
    gender: string;
    roleIds: number[];
}
