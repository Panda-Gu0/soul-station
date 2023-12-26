import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ApiException } from 'src/common/filter/http-exception/api.exception';
import { ApiErrorCode } from 'src/common/enums/api-error-code.enum';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>
    ) { }
    async create(createPermissionDto: CreatePermissionDto) {
        const name = createPermissionDto.name;
        const existPermission = await this.permissionRepository.findOne({ where: { name } });
        if (existPermission) {
            throw new ApiException("该权限字段已存在", ApiErrorCode.PERMISSSION_EXIST);
        }
        return await this.permissionRepository.save(createPermissionDto);
    }
}
