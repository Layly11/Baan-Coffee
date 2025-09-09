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
import { CustomersModel } from './Customer';
import { OrderItemModel } from './OrderItems';

interface Addresss {
    name: string,
    house_no: string,
    village: string,
    street: string,
    city: string,
}

export class OrderModel extends Model<
    InferAttributes<OrderModel>,
    InferCreationAttributes<OrderModel>
> {
    declare id: CreationOptional<number>;
    declare summary_id: ForeignKey<DailySummaryModel['id']>;
    declare order_id: string;
    declare time: Date;
    declare customer_id: ForeignKey<CustomersModel['id']>;;
    declare payment_method: 'qr' | 'credit';
    declare total_price: number;
    declare shipping_address: Addresss
    declare status: 'pending' | 'preparing' | 'out_for_delivery' |'complete' | 'cancelled';
    declare items?: OrderItemModel[];
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
            type: DataTypes.DATE,
            allowNull: false,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.ENUM('qr', 'credit'),
            allowNull: false,
        },
        total_price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        shipping_address: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'preparing', 'out_for_delivery' ,'complete', 'cancelled'),
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
