import { Migration } from 'sequelize-cli'
import { DataTypes } from 'sequelize'
import bcrypt from 'bcryptjs' 

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_role',
          key: 'id',
        },
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
       status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
      recent_login: {
        type: Sequelize.DATE,
      },
      last_login: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

      const now = new Date();
      const hashedPassword = await bcrypt.hash('140974saiaye', 10);
       await queryInterface.bulkInsert('users', [{
      role_id: 1,
      username: 'admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      recent_login: now,
      last_login: now,
      created_at: now,
      updated_at: now
    }]);
    
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
} satisfies Migration;
