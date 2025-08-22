"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./helpers/dotenv.helper");
const app_1 = __importDefault(require("./app"));
const redis_1 = require("./helpers/redis");
const winston_1 = __importDefault(require("./helpers/winston"));
const sequelize_helper_1 = __importDefault(require("./helpers/sequelize.helper"));
const PORT = Number(process.env.PORT);
const MAX_RETRY_START = 3;
const RETRY_DELAY = 30000;
async function retryConnection(connectFunction) {
    let attempts = 0;
    let isConnect = false;
    while (attempts < MAX_RETRY_START) {
        try {
            const result = connectFunction(winston_1.default);
            if (result instanceof Promise) {
                await result;
            }
            isConnect = true;
            break;
        }
        catch (error) {
            attempts = attempts + 1;
            if (attempts < MAX_RETRY_START) {
                winston_1.default.error(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }
    return isConnect;
}
async function init() {
    const connectDatabase = await retryConnection(sequelize_helper_1.default);
    const connectRedis = await retryConnection(redis_1.initializeRedisClient);
    if (connectDatabase && connectRedis) {
        const redis = (0, redis_1.getRedisClient)();
        const server = (0, app_1.default)({ redis }).listen(PORT, () => {
            winston_1.default.info(`Coffee Service listening at: http://localhost:${PORT}`);
        });
        function gracefulShutdown() {
            winston_1.default.info('Received kill signal, shutting down gracefully...');
            server.close(() => {
                winston_1.default.info('Closed out remaining connections.');
                process.exit(0);
            });
            setTimeout(() => {
                winston_1.default.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        }
        process.on('SIGINT', gracefulShutdown);
    }
    else {
        winston_1.default.error('Failed to connect infrastructure services');
        process.exit(1);
    }
}
void init();
//# sourceMappingURL=index.js.map