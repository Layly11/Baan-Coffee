import { Migration } from 'sequelize-cli';

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sizes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      volume_ml: {
        type: Sequelize.STRING,
        allowNull: false
      },
      extra_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    const now = new Date();
    await queryInterface.bulkInsert('sizes', [
      {
        id: 1,
        name: 'Short',
        volume_ml: '230 ml',
        extra_price: 0,
        created_at: now,
        updated_at: now
      },
      {
        id: 2,
        name: 'Tall',
        volume_ml: '354 ml',
        extra_price: 10,
        created_at: now,
        updated_at: now
      },
       {
        id: 3,
        name: 'Grande',
        volume_ml: '473 ml',
        extra_price: 15,
        created_at: now,
        updated_at: now
      },
       {
        id: 4,
        name: 'Venti',
        volume_ml: '591 ml',
        extra_price: 20,
        created_at: now,
        updated_at: now
      },
    ]);

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sizes');
  },
} satisfies Migration;
