"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorLog = exports.createResponseLog = exports.createRequestLog = void 0;
const moment_1 = __importDefault(require("moment"));
const nanoid_1 = require("nanoid");
const winston_1 = __importDefault(require("../helpers/winston"));
const helpers_1 = require("@coffee/helpers");
const createRequestLog = () => (req, res, next) => {
    res.locals.requestId = req.headers['x-request-uid'] || (0, nanoid_1.nanoid)();
    res.locals.requestTime = (0, moment_1.default)();
    winston_1.default.info('Request ' +
        `${res.locals.requestId} ` +
        `${req.method} ` +
        `${req.originalUrl} ` +
        `${req.ip} ` +
        `${req.headers['user-agent']}`, {
        appName: 'Coffee-shop',
        source: 'coffee-service',
        requestId: res.locals.requestId,
        type: 'request',
        method: req.method,
        url: req.originalUrl,
        req: {
            headers: JSON.stringify(JSON.parse(JSON.stringify(req.headers))),
            body: JSON.stringify(req.body),
            params: JSON.stringify(JSON.parse(JSON.stringify(req.params))),
            query: JSON.stringify(req.query)
        }
    });
    next();
};
exports.createRequestLog = createRequestLog;
const createResponseLog = () => (req, res, next) => {
    const requestUID = res.locals.requestId;
    const requestTime = res.locals.requestTime;
    const body = res.locals.body;
    const user = req.user;
    const responseTime = (0, moment_1.default)().diff(requestTime, 'milliseconds');
    winston_1.default.info('Response ' +
        `${requestUID} ` +
        `${req.method} ` +
        `${req.originalUrl} ` +
        `${res.statusCode} ` +
        `${responseTime}ms`, {
        requestUID,
        type: 'response',
        method: req.method,
        url: req.originalUrl,
        appName: 'Coffee-Shop',
        source: 'Coffee-service',
        resp: {
            status: res.statusCode,
            time: responseTime,
            timeUnit: 'ms',
            headers: JSON.stringify(res.getHeaders()),
            body: JSON.stringify(body)
        },
        rmid: user?.staff_id || null
    });
    next();
};
exports.createResponseLog = createResponseLog;
const createErrorLog = () => (err, req, res, next) => {
    const requestUID = res.locals.requestId;
    const requestTime = res.locals.requestTime;
    const functionName = res.locals.functionName;
    if (err instanceof helpers_1.ServiceError || err instanceof helpers_1.ValidationError || err instanceof helpers_1.InternalServiceError) {
        let resDesc = (err instanceof helpers_1.InternalServiceError) ? err.resDesc : err.resDesc.th;
        if (err instanceof helpers_1.ValidationError) {
            resDesc += `: ${err.details[0].msg ? err.details[0].msg : err.details[0].path}`;
        }
        res.status(err.statusCode).json({
            request_uid: requestUID,
            res_code: err.resCode,
            res_desc: resDesc
        });
    }
    else {
        res.status(500).json({
            request_uid: requestUID,
            res_code: '0500',
            res_desc: 'Internal Server Error'
        });
    }
    const responseTime = (0, moment_1.default)().diff(requestTime, 'milliseconds');
    winston_1.default.error('Response ' +
        `${res.locals.requestId} ` +
        `${req.method} ` +
        `${req.originalUrl} ` +
        `${res.statusCode} ` +
        `${responseTime}ms`, {
        requestUID,
        type: 'response',
        method: req.method,
        url: req.originalUrl,
        functionName,
        appName: 'Coffee-Shop',
        source: 'Coffee-service',
        resp: {
            status: res.statusCode,
            time: responseTime,
            timeUnit: 'ms',
            headers: JSON.stringify(res.getHeaders())
        },
        error: {
            message: JSON.stringify(err),
            stack: JSON.stringify(err.stack)
        }
    });
};
exports.createErrorLog = createErrorLog;
//# sourceMappingURL=logController.js.map