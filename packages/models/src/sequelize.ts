import { Dialect, Sequelize } from 'sequelize'
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_NAME!,
    process.env.DB_USER!,
    process.env.DB_PASSWORD!,
    {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT),
        dialect: process.env.DB_DIALECT as Dialect
    }
)

export const connectDB = async () => {
    try{
        await sequelize.authenticate();
        console.log('SQL Database Connected successfully.');
    } catch (error) {
         console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

