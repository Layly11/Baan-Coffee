import { createClient, RedisClientType } from 'redis'
import winston from './winston'
let redisClient: RedisClientType

async function initializeRedisClient() {
    if (!process.env.REDIS_URL) {
        console.warn('REDIS_URL is not set in environment variables. Using default localhost:6379.');
    }

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
        redisClient = createClient({ url: redisUrl }) as RedisClientType;

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        await redisClient.connect();
        winston.info('Redis connected')
    } catch (error) {
        winston.error('Unable to connect redis')
        process.exit(1);
    }
}

function getRedisClient(): RedisClientType {
    if (!redisClient) {
        console.warn('Redis client not initialized. Calling initializeRedisClient(). This might indicate a setup issue.');
        initializeRedisClient();
    }
    return redisClient;
}

export { initializeRedisClient, getRedisClient };