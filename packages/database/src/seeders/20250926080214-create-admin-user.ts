import bcrypt from "bcryptjs";
import { Migration } from 'sequelize-cli'

export = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const hashedPassword = await bcrypt.hash("140974saiaye", 10);

    const [user] = await queryInterface.sequelize.query(
  `SELECT * FROM users WHERE email = 'admin@gmail.com'`
);

if (!user.length) {
  await queryInterface.bulkInsert("users", [
    {
      role_id: 1,
      username: "admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      status: true,
      recent_login: now,
      last_login: now,
      created_at: now,
      updated_at: now,
    }
  ]);
}
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("users", { email: "admin@gmail.com" }, {});
  },
} satisfies Migration;
