import { Migration } from 'sequelize-cli';

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('top_products', {
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
        }
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      total_sold: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total_sales: {
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable('top_products');
  },
} satisfies Migration;
