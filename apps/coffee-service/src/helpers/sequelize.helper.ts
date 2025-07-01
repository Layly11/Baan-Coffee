import { sequelize } from "@coffee/models";

import winston from './winston'

const databaseConnect = async () => {
  try {
    await sequelize.authenticate()
    winston.info('Database connected')
  } catch (error) {
    winston.error('Unable to connect database', JSON.stringify(error))
    throw error
  }
}
export default databaseConnect