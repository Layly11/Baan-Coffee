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

export class AddressModel extends Model<
  InferAttributes<AddressModel>,
  InferCreationAttributes<AddressModel>
> {
  declare id: CreationOptional<number>
  declare customer_id: ForeignKey<CustomersModel['id']>
  declare type: 'Home' | 'Office' | 'Other'
  declare name: CreationOptional<string>
  declare house_no: string
  declare village: CreationOptional<string>
  declare street: CreationOptional<string>
  declare city: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

AddressModel.init(
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
    type: {
      type: DataTypes.ENUM('Home', 'Office', 'Other'),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    house_no: {
      type: DataTypes.STRING,
      allowNull: false
    },
    village: {
      type: DataTypes.STRING,
      allowNull: true
    },
    street: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
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
    tableName: 'address',
    modelName: 'address',
    timestamps: true
  }
)
