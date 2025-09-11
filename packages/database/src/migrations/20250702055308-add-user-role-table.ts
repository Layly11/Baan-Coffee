import { Migration } from 'sequelize-cli'

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_role', {
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
    await queryInterface.bulkInsert('user_role', [
      {
        id: 1,
        name: 'SUPER_ADMIN',
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        name: 'ADMIN',
        created_at: now,
        updated_at: now
      },
      {
        id: 3,
        name: 'MANAGER',
        created_at: now,
        updated_at: now
      },
        {
        id: 4,
        name: 'SUPPORT',
        created_at: now,
        updated_at: now
      },
    ]);

    
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_role')
  },
} satisfies Migration
