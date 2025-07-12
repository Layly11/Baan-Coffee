import { Migration } from 'sequelize-cli'

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('inventory_status', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      summary_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
         references: {
          model: 'daily_summary',
          key: 'id',
        },
      },
      product_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      remaining: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING,
        allowNull: false
      },
      alert_level: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('normal', 'low', 'out_of_stock'),
        allowNull: false
      },
      last_updated: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('inventory_status')
  }
} satisfies Migration