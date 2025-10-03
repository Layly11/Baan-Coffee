import { Migration } from 'sequelize-cli'

export = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_log', {
      id: {
        type: Sequelize.INTEGER({ length: 11 }),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      menu: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      source_type: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      editor_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      editor_role: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      destination_type: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      target_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },
      detail: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      event_date_time: {
        type: Sequelize.DATE(),
        allowNull: true
      },
      staff_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      staff_email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      channel: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      search_criteria: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      previous_values: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      new_values: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      record_key_values: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_pii: {
        type: Sequelize.STRING(255),
        allowNull: true
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
    await queryInterface.dropTable('audit_log')
  },
} satisfies Migration
