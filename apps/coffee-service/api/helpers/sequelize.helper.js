"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("@coffee/models");
const winston_1 = __importDefault(require("./winston"));
const databaseConnect = async () => {
    try {
        await models_1.sequelize.authenticate();
        winston_1.default.info('Database connected');
    }
    catch (error) {
        winston_1.default.error('Unable to connect database', JSON.stringify(error));
        throw error;
    }
};
exports.default = databaseConnect;
//# sourceMappingURL=sequelize.helper.js.map