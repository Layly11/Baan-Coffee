import { DataTypes } from 'sequelize';
import { Migration } from 'sequelize-cli';

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('temp_order_products', {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('temp_order_products');
  },
} satisfies Migration;
