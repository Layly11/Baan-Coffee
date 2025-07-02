import { Migration } from 'sequelize-cli'

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('map_user_permission', {
      id: {
        type: Sequelize.INTEGER({ length: 11 }),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      role_id: {
        type: Sequelize.INTEGER({ length: 11 }),
        allowNull: false,
        references: {
          model: 'user_role',
          key: 'id',
        },
      },
      menu_id: {
        type: Sequelize.INTEGER({ length: 11 }),
        allowNull: false,
        references: {
          model: 'menu_permission',
          key: 'id',
        },
      },
      name: {
        type: Sequelize.STRING(45),
        allowNull: false,
      },
      view: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      create: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      edit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      delete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('map_user_permission')
  },
} satisfies Migration
