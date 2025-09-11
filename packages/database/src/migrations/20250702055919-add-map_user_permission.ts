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

    const now = new Date();
    await queryInterface.bulkInsert('map_user_permission', [


      { role_id: 1, menu_id: 1, name: 'DASHBOARD_SUPER_ADMIN', view: true, create: false, edit: true, delete: false, created_at: now, updated_at: now },
      { role_id: 1, menu_id: 2, name: 'PRODUCT_MENU_SUPER_ADMIN', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },
      { role_id: 1, menu_id: 3, name: 'ORDER_MANAGEMENT_SUPER_ADMIN', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },
      { role_id: 1, menu_id: 4, name: 'MANAGE_CUSTOMER_SUPER_ADMIN', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },
      { role_id: 1, menu_id: 5, name: 'MANAGE_USER_SUPER_ADMIN', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },


      { role_id: 2, menu_id: 1, name: 'DASHBOARD_ADMIN', view: true, create: false, edit: false, delete: false, created_at: now, updated_at: now },
      { role_id: 2, menu_id: 2, name: 'PRODUCT_MENU_ADMIN', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },
      { role_id: 2, menu_id: 3, name: 'ORDER_MANAGEMENT_ADMIN', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },
      { role_id: 2, menu_id: 4, name: 'MANAGE_CUSTOMER_ADMIN', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },
      { role_id: 2, menu_id: 5, name: 'MANAGE_USER_ADMIN', view: true, create: false, edit: false, delete: false, created_at: now, updated_at: now },


      { role_id: 3, menu_id: 1, name: 'DASHBOARD_MANAGER', view: true, create: false, edit: false, delete: false, created_at: now, updated_at: now },
      { role_id: 3, menu_id: 2, name: 'PRODUCT_MENU_MANAGER', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },
      { role_id: 3, menu_id: 3, name: 'ORDER_MANAGEMENT_MANAGER', view: true, create: true, edit: true, delete: true, created_at: now, updated_at: now },
      { role_id: 3, menu_id: 4, name: 'MANAGE_CUSTOMER_MANAGER', view: false, create: false, edit: false, delete: false, created_at: now, updated_at: now },
      { role_id: 3, menu_id: 5, name: 'MANAGE_USER_MANAGER', view: false, create: false, edit: false, delete: false, created_at: now, updated_at: now },


      { role_id: 4, menu_id: 1, name: 'DASHBOARD_SUPPORT', view: true, create: false, edit: false, delete: false, created_at: now, updated_at: now },
      { role_id: 4, menu_id: 2, name: 'PRODUCT_MENU_SUPPORT', view: false, create: false, edit: false, delete: false, created_at: now, updated_at: now },
      { role_id: 4, menu_id: 3, name: 'ORDER_MANAGEMENT_SUPPORT', view: false, create: false, edit: false, delete: false, created_at: now, updated_at: now },
      { role_id: 4, menu_id: 4, name: 'MANAGE_CUSTOMER_SUPPORT', view: true, create: true, edit: true, delete: false, created_at: now, updated_at: now },
      { role_id: 4, menu_id: 5, name: 'MANAGE_USER_SUPPORT', view: false, create: false, edit: false, delete: false, created_at: now, updated_at: now },



    ]);
  },



  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('map_user_permission')
  },
} satisfies Migration
