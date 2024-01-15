import { IsArray, IsNotEmpty, ArrayNotEmpty, IsInt } from "class-validator";

export class CreateRoleDto {
  @IsNotEmpty({
    message: "角色名称不能为空"
  })
  name: string;

  @IsArray({
    message: "permissionIds必须是一个数组"
  })
  @ArrayNotEmpty({
    message: "permissionIds不能为空"
  })
  @IsInt({ each: true, message: "permissionIds必须是整数数组" })
  permissionIds: number[];
}