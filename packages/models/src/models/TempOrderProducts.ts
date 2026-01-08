import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

import { sequelize } from "../sequelize";

export class TempOrderProductsModel extends Model<
  InferAttributes<TempOrderProductsModel>,
  InferCreationAttributes<TempOrderProductsModel>
> {
  public id!: CreationOptional<number>;;
  public token!: string;
  public customer_id!: number;
  public products!: string;
  public expire_at!: Date;
  //order_id
  //amount
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TempOrderProductsModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    token: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    products: { type: DataTypes.TEXT, allowNull: false },
    expire_at: { type: DataTypes.DATE, allowNull: false },
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
    tableName: "temp_order_products",
    modelName: "temp_order_products",
    timestamps: true,
    underscored: true,
  }
);
