import {
    Model,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    CreationOptional,
    ForeignKey,
} from 'sequelize';

import { sequelize } from '../sequelize';
import { CustomersModel } from './Customer';
import { OrderModel } from './Orders';


export class PaymentModel extends Model<
    InferAttributes<PaymentModel>,
    InferCreationAttributes<PaymentModel>
> {
    declare id: CreationOptional<number>;
    declare order_id: ForeignKey<OrderModel['id']>
    declare order_code: string
    declare reference: CreationOptional<string | null>
    declare customer_id: ForeignKey<CustomersModel['id']>;
    declare description: string
    declare amount: number
    declare payment_method : string
    declare status: string
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

PaymentModel.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        order_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        order_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        customer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
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
        tableName: 'payments',
        modelName: 'payments',
        timestamps: true,
        underscored: true,
    }
);
