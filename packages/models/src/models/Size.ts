import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from 'sequelize';

import { sequelize } from '../sequelize';
import { ProductModel } from './Product';


export class SizeModel extends Model<
    InferAttributes<SizeModel>,
    InferCreationAttributes<SizeModel>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare volume_ml: string;
    declare extra_price: number;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

SizeModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        volume_ml: {
            type: DataTypes.STRING,
            allowNull: false
        },
        extra_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        createdAt: {
            field: 'created_at',
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            field: 'updated_at',
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        timestamps: true,
        tableName: 'sizes',
        modelName: 'sizes',
    }
)