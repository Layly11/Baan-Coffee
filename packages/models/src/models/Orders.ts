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

interface OrderItem {
    product: string;
    qty: number;
}

export class OrderModel extends Model<
    InferAttributes<OrderModel>,
    InferCreationAttributes<OrderModel>
> {
    declare id: CreationOptional<number>;
    declare summary_id: ForeignKey<DailySummaryModel['id']>;
    declare order_id: string;
    declare time: string;
    declare customer_name: string;
    declare payment_method: 'cash' | 'qr' | 'credit';
    declare total_price: number;
    declare channel: 'in_store' | 'delivery' | 'grab' | 'lineman';
    declare status: 'pending' | 'complete' | 'cancelled';
    declare items: OrderItem[];

    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

OrderModel.init(
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
        order_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        time: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customer_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.ENUM('cash', 'qr', 'credit'),
            allowNull: false,
        },
        total_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        channel: {
            type: DataTypes.ENUM('in_store', 'delivery', 'grab', 'lineman'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'complete', 'cancelled'),
            allowNull: false,
        },
        items: {
            type: DataTypes.JSON,
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
        tableName: 'orders',
        modelName: 'orders',
        timestamps: true,
        underscored: true,
    }
);
