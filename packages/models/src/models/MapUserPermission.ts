import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
    BelongsTo,
    NonAttribute
} from 'sequelize'


import { sequelize } from '../sequelize'
import { MenuPermissionModel } from './MenuPermission'
import { UserRoleModel } from './UserRole'


export class MapUserPermissionModel extends Model<
    InferAttributes<MapUserPermissionModel>,
    InferCreationAttributes<MapUserPermissionModel>
> {
    declare id: CreationOptional<number>
    declare name: string
    declare view: boolean
    declare create: boolean
    declare edit: boolean
    declare delete: boolean
    declare created_at: Date
    declare updated_at: Date

    declare menu_id: BelongsTo<MenuPermissionModel>
    declare role_id: BelongsTo<UserRoleModel>

    declare menu: NonAttribute<MenuPermissionModel>
}

MapUserPermissionModel.init(
    {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        role_id: {
            field: 'role_id',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        menu_id: {
            field: 'menu_id',
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            field: 'name',
            type: DataTypes.STRING(45),
            allowNull: false
        },
        view: {
            field: 'view',
            type: DataTypes.BOOLEAN,
            allowNull: false
        },

        create: {
            field: 'create',
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        edit: {
            field: 'edit',
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        delete: {
            field: 'delete',
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
         created_at: {
            field: 'created_at',
            type: DataTypes.DATE,
            allowNull: false
        },
        updated_at: {
            field: 'updated_at',
            type: DataTypes.DATE,
            allowNull: false
        }
    },
    {
        sequelize,
        modelName: 'map_user_permission',
        underscored: true
    }
)