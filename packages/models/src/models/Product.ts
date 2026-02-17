import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from 'sequelize';

import { sequelize } from '../sequelize';

import { CategoriesModel } from './Categories';

export class ProductModel extends Model<
    InferAttributes<ProductModel>,
    InferCreationAttributes<ProductModel>
> {
    declare id: CreationOptional<number>;
    declare name: string;
    declare price: number;
    declare category_id: ForeignKey<CategoriesModel['id']>;
    declare status: boolean;
    declare is_deleted: CreationOptional<boolean>;
    declare image_url: CreationOptional<string | null>;
    declare description: CreationOptional<string | null>;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

ProductModel.init(
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
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
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
        tableName: 'products',
        modelName: 'products',
    }
)