import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from 'sequelize';

import { sequelize } from '../sequelize';
import { DailySummaryModel } from './DailySummary';

export class TopProductModel extends Model<
    InferAttributes<TopProductModel>,
    InferCreationAttributes<TopProductModel>
> {
    declare id: CreationOptional<number>;
    declare summary_id: ForeignKey<DailySummaryModel['id']>;
    declare product_name: string;
    declare total_sold: number;
    declare total_sales: number;
    
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

TopProductModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        summary_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        total_sold: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_sales: {
            type: DataTypes.FLOAT,
            allowNull: false,
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
        tableName: 'top_products',
        modelName: 'top_products',
        timestamps: true,
        underscored: true,
    }
);
