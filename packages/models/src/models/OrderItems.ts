import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

import { sequelize } from "../sequelize";
import { OrderModel } from "./Orders";
import { ProductModel } from "./Product";

export class OrderItemModel extends Model<
  InferAttributes<OrderItemModel>,
  InferCreationAttributes<OrderItemModel>
> {
  declare id: CreationOptional<number>;
  declare order_id: ForeignKey<OrderModel["id"]>;
  declare product_id: ForeignKey<ProductModel["id"]>;
  declare name: string; 
  declare price: number; 
  declare qty: number;
  declare size: string

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

OrderItemModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      field: "created_at",
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      field: "updated_at",
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "order_items",
    modelName: "order_items",
    timestamps: true,
    underscored: true,
  }
);
