"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeRedisClient = initializeRedisClient;
exports.getRedisClient = getRedisClient;
const redis_1 = require("redis");
const winston_1 = __importDefault(require("./winston"));
let redisClient;
async function initializeRedisClient() {
    if (!process.env.REDIS_URL) {
        console.warn('REDIS_URL is not set in environment variables. Using default localhost:6379.');
    }
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
        redisClient = (0, redis_1.createClient)({ url: redisUrl });
        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });
        await redisClient.connect();
        winston_1.default.info('Redis connected');
    }
    catch (error) {
        winston_1.default.error('Unable to connect redis');
        process.exit(1);
    }
}
function getRedisClient() {
    if (!redisClient) {
        console.warn('Redis client not initialized. Calling initializeRedisClient(). This might indicate a setup issue.');
        initializeRedisClient();
    }
    return redisClient;
}
//# sourceMappingURL=redis.js.map