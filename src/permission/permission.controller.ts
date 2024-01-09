import { Body, Controller, Post } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  /**
   *  新增权限字段
   */
  @Post()
  create(@Body() createPermission: CreatePermissionDto) {
    return this.permissionService.create(createPermission);
  }
}
