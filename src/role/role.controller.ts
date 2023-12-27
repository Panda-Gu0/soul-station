import { Body, Controller, Post } from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Post()
  create(@Body() createRole: CreateRoleDto) {
    return this.roleService.create(createRole);
  }
}
