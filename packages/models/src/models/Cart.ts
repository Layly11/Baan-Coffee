import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey
} from 'sequelize'

import { sequelize } from '../sequelize'
import { CustomersModel } from './Customer'
import { ProductModel } from './Product'
import { SizeModel } from './Size'

export class CartModel extends Model<
  InferAttributes<CartModel>,
  InferCreationAttributes<CartModel>
> {
  declare id: CreationOptional<number>
  declare customer_id: ForeignKey<CustomersModel['id']>
  declare product_id: ForeignKey<ProductModel['id']>
  declare size_id : ForeignKey<SizeModel['id']>
  declare quantity : CreationOptional<number>
  declare extra_price: CreationOptional<number>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

CartModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    extra_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'cart',
    modelName: 'cart',
    timestamps: true,
    underscored: true
  }
)
