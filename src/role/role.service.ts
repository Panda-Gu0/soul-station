import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { In, Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiException } from 'src/common/filter/http-exception/api.exception';
import { ApiErrorCode } from 'src/common/enums/api-error-code.enum';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private roelRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>
    ){ }
    /**
     * 创建用户权限
     * @param createRole - 用户权限对象
     */
    async create(createRole: CreateRoleDto) {
        const permissions = await this.permissionRepository.find({
            where: {
                id: In(createRole.permissionIds)
            }
        });
        const name = createRole.name;
        const existRole = await this.roelRepository.findOne({
            where: { name }
        });
        if(existRole) {
            throw new ApiException("角色类型已存在", ApiErrorCode.ROLE_EXIST);
        }
        return this.roelRepository.save({ permissions, name });
    };
}
