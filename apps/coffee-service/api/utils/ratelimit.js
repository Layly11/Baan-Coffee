"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerifyResetOtpLimiter = exports.getForgorPasswordLimiter = exports.getResetOtpLimiter = exports.getLoginLimiter = exports.getVerifyLimiter = exports.getOtpLimiter = void 0;
const express_rate_limit_1 = __importStar(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
const getOtpLimiter = (redis) => (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: {
        res_code: '0499',
        res_desc: 'Too many OTP attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `otp:${req.body?.email || (0, express_rate_limit_1.ipKeyGenerator)(req)}`,
    store: new rate_limit_redis_1.default({
        sendCommand: async (...args) => redis.sendCommand(args),
    })
});
exports.getOtpLimiter = getOtpLimiter;
const getVerifyLimiter = (redis) => (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: {
        res_code: '0498',
        res_desc: 'Too many verify. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `otp:verify:${req.body?.email || (0, express_rate_limit_1.ipKeyGenerator)(req)}`,
    store: new rate_limit_redis_1.default({
        sendCommand: async (...args) => redis.sendCommand(args),
    })
});
exports.getVerifyLimiter = getVerifyLimiter;
const getLoginLimiter = (redis) => (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: {
        res_code: "0488",
        res_desc: "Too many login attempts. Please try again in 10 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `login:${req.body?.email || (0, express_rate_limit_1.ipKeyGenerator)(req)}`,
    store: new rate_limit_redis_1.default({
        sendCommand: async (...args) => redis.sendCommand(args),
    })
});
exports.getLoginLimiter = getLoginLimiter;
const getResetOtpLimiter = (redis) => (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        res_code: '0477',
        res_desc: 'Too many OTP attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `reset_otp_limit:${req.body?.email || (0, express_rate_limit_1.ipKeyGenerator)(req)}`,
    store: new rate_limit_redis_1.default({
        sendCommand: async (...args) => redis.sendCommand(args),
    }),
});
exports.getResetOtpLimiter = getResetOtpLimiter;
const getForgorPasswordLimiter = (redis) => (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        res_code: '0466',
        res_desc: 'Too many password reset requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `reset_forgot_limit:${req.body?.email || (0, express_rate_limit_1.ipKeyGenerator)(req)}`,
    store: new rate_limit_redis_1.default({
        sendCommand: async (...args) => redis.sendCommand(args),
    }),
});
exports.getForgorPasswordLimiter = getForgorPasswordLimiter;
const getVerifyResetOtpLimiter = (redis) => (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        res_code: '0466',
        res_desc: 'Too many verify password reset. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `reset_verify_limit:${req.body?.email || (0, express_rate_limit_1.ipKeyGenerator)(req)}`,
    store: new rate_limit_redis_1.default({
        sendCommand: async (...args) => redis.sendCommand(args),
    }),
});
exports.getVerifyResetOtpLimiter = getVerifyResetOtpLimiter;
//# sourceMappingURL=ratelimit.js.map