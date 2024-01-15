import { IsNotEmpty, IsString } from "class-validator";

export class CreatePermissionDto {
    @IsString({
      message: "权限名称必须是string类型"
    })
    @IsNotEmpty({
      message: "权限名称不能为空"
    })
    name: string;

    @IsString({
      message: "权限描述必须是string类型"
    })
    @IsNotEmpty({
      message: "权限描述不能为空"
    })
    desc: string;
  }