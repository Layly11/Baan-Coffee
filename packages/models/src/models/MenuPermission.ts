import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional
} from 'sequelize'


import { sequelize } from '../sequelize'

export class MenuPermissionModel extends Model<
    InferAttributes<MenuPermissionModel>,
    InferCreationAttributes<MenuPermissionModel>
> {
    declare id: CreationOptional<number>
    declare name: string
    declare created_at: Date
    declare updated_at: Date
}

MenuPermissionModel.init(
    {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        name: {
            field: 'name',
            type: DataTypes.STRING(45),
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
        tableName: 'menu_permission',
        modelName: 'menu_permission',
        underscored: true
    }
)