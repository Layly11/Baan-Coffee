import { Migration } from 'sequelize-cli'

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('daily_summary', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      total_sales: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      total_orders: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      total_items: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      payments: {
        type: Sequelize.JSON,
        allowNull: false
      },
      first_order_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      last_order_time: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('daily_summary')
  },
} satisfies Migration
