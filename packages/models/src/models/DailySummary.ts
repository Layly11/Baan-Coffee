import {
    Model,
    DataTypes,
    type InferAttributes,
    type InferCreationAttributes,
    type CreationOptional,
} from 'sequelize'

import { sequelize } from '../sequelize'

interface Payments {
    cash: number
    qr: number
    credit: number
}

export class DailySummaryModel extends Model<
    InferAttributes<DailySummaryModel>,
    InferCreationAttributes<DailySummaryModel>
> {
    declare id: CreationOptional<number>
    declare date: Date
    declare total_sales: number
    declare total_orders: number
    declare total_items: number
    declare payments: Payments
    declare first_order_time: string
    declare last_order_time: string
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
}

DailySummaryModel.init(
    {
        id: {
            field: 'id',
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        date: {
            field: 'date',
            type: DataTypes.DATE,
            allowNull: false
        },
        total_sales: {
            field: 'total_sales',
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        total_orders: {
            field: 'total_orders',
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_items: {
            field: 'total_items',
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        payments: {
            field: 'payments',
            type: DataTypes.JSON,
            allowNull: false,
        },
        first_order_time: {
            field: 'first_order_time',
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_order_time: {
            field: 'last_order_time',
            type: DataTypes.STRING,
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
        tableName: 'daily_summary',
        modelName:'daily_summary',
        timestamps: true
    }
)