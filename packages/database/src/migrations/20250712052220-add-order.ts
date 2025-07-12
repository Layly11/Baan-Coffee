import { Migration } from 'sequelize-cli';

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      summary_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'daily_summary',
          key: 'id',
        },
      },
      order_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      time: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customer_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'qr', 'credit'),
        allowNull: false,
      },
      total_price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      channel: {
        type: Sequelize.ENUM('in_store', 'delivery', 'grab', 'lineman'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'complete', 'cancelled'),
        allowNull: false,
      },
      items: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('orders');
  },
} satisfies Migration;
