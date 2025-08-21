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
import { SizeModel } from './Size';


export class ProductSizeModel extends Model<
    InferAttributes<ProductSizeModel>,
    InferCreationAttributes<ProductSizeModel>
> {
    declare id: CreationOptional<number>;
    declare product_id: ForeignKey<ProductModel['id']>;
    declare size_id: ForeignKey<SizeModel['id']>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ProductSizeModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        size_id: {
            type: DataTypes.INTEGER,
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
        tableName: 'product_sizes',
        modelName: 'product_sizes',
    }
)