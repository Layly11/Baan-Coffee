"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const passport_1 = __importDefault(require("./helpers/passport"));
const routers_1 = __importDefault(require("./routers"));
const logController_1 = require("./controller/logController");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const APP = ({ redis }) => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: 'https://baan-coffee-coffee-app.vercel.app',
        credentials: true,
    }));
    app.set('trust proxy', true);
    app.enable('trust proxy');
    app.disable('x-powered-by');
    app.use(express_1.default.json());
    app.use((0, body_parser_1.urlencoded)({ extended: true }));
    app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
    app.use(passport_1.default.initialize());
    app.use((req, res, next) => {
        res.header('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate');
        next();
    });
    app.use((0, logController_1.createRequestLog)());
    app.get('/', (req, res, next) => {
        res.send("Welcome to Server BaanCoffee!!!🛜");
        next();
    });
    app.use((0, routers_1.default)({ redis }));
    app.use((0, logController_1.createResponseLog)());
    app.use((0, logController_1.createErrorLog)());
    return app;
};
exports.default = APP;
//# sourceMappingURL=app.js.map