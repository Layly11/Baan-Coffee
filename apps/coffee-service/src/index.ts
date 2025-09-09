import './helpers/dotenv.helper'
import app from './app'
import { scheduleCleanupJob } from "./jobs/cleanupBlobs";

import { getRedisClient, initializeRedisClient } from './helpers/redis'
import winston from './helpers/winston'
import databaseConnect from './helpers/sequelize.helper'
const PORT = Number(process.env.PORT)
const MAX_RETRY_START = 3
const RETRY_DELAY = 30000

async function retryConnection<T>(connectFunction: (winston?: any) => T | Promise<T>): Promise<boolean> {
    let attempts = 0
    let isConnect = false
    while (attempts < MAX_RETRY_START) {
        try {
            const result = connectFunction(winston)
            if (result instanceof Promise) {
                await result
            }
            isConnect = true
            break
        } catch (error) {
            attempts = attempts + 1
            if (attempts < MAX_RETRY_START) {
                winston.error(`Retrying in ${RETRY_DELAY / 1000} seconds...`)
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            }
        }
    }
    return isConnect
}


async function init(): Promise<void> {
    const connectDatabase = await retryConnection(databaseConnect)
    const connectRedis = await retryConnection(initializeRedisClient)

    if (connectDatabase && connectRedis) {
        const redis = getRedisClient()
        const server = app({ redis }).listen(PORT, () => {
            winston.info(`Coffee Service listening at: http://localhost:${PORT}`)
            scheduleCleanupJob()
        })

        function gracefulShutdown() {
            winston.info('Received kill signal, shutting down gracefully...')

            server.close(() => {
                winston.info('Closed out remaining connections.')
                process.exit(0)
            })

            setTimeout(() => {
                winston.error('Could not close connections in time, forcefully shutting down')
                process.exit(1)
            }, 10000)
        }

        process.on('SIGINT', gracefulShutdown)
    } else {
        winston.error('Failed to connect infrastructure services')
        process.exit(1)
    }
}

void init()