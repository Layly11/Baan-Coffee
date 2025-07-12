import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey
} from 'sequelize';

import { sequelize } from '../sequelize';
import { DailySummaryModel } from './DailySummary'

export class InventoryStatusModel extends Model<
    InferAttributes<InventoryStatusModel>,
    InferCreationAttributes<InventoryStatusModel>
> {
    declare id: CreationOptional<number>;
    declare summary_id: ForeignKey<DailySummaryModel['id']>;
    declare product_name: string;
    declare remaining: number;
    declare unit: string;
    declare alert_level: number;
    declare status: 'normal' | 'low' | 'out_of_stock';
    declare last_updated: Date;

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

InventoryStatusModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        summary_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        remaining: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false
        },
        alert_level: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('normal', 'low', 'out_of_stock'),
            allowNull: false
        },
        last_updated: {
            type: DataTypes.DATE,
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
        tableName: 'inventory_status',
        modelName: 'inventory_status',
        timestamps: true,
        underscored: true
    }
);
