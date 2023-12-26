import { Permission } from "src/permission/entities/permission.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ length: 20 })
    name: string;

    @CreateDateColumn()
    createTime: Date;

    @UpdateDateColumn()
    updateTime: Date;

    // 多对多关系联合 permission 表
    @ManyToMany(() => Permission)
    @JoinTable({
        name: "role_permission_relation"
    })
    permissions: Permission[];
}