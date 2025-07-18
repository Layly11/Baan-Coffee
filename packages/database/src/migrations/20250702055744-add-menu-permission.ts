import { Migration } from 'sequelize-cli'

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('menu_permission', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(45),
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

    const now = new Date();
    await queryInterface.bulkInsert('menu_permission', [
      {
        id: 1,
        name: 'DASHBOARD',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        name: 'MANAGE_USER',
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        name: 'ORDER_MANAGEMENT',
        created_at: now,
        updated_at: now
      },
      {
        id: 4,
        name: 'SALES',
        created_at: now,
        updated_at: now
      },
      {
        id:5,
        name: 'PRODUCT_MENU',
        created_at: now,
        updated_at: now
      },
      {
        id: 6,
        name: 'INVENTORY',
        created_at: now,
        updated_at: now
      },
      {
        id: 7,
        name: 'SHIFT_SCHEDULE',
        created_at: now,
        updated_at: now
      },
      {
        id: 8,
        name: 'REPORTS',
        created_at: now,
        updated_at: now
      },
      {
        id: 9,
        name: 'PROFILE_SETTINGS',
        created_at: now,
        updated_at: now
      },



    ]);

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('menu_permission')
  },
} satisfies Migration
