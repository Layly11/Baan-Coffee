import { Migration } from 'sequelize-cli';

export = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('products', 'is_deleted', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('products', 'is_deleted');
    },
} satisfies Migration;
