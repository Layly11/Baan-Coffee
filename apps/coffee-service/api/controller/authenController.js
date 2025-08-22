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
exports.checkAvailability = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const jose = __importStar(require("jose"));
const models_1 = require("@coffee/models");
const helpers_1 = require("@coffee/helpers");
const authen_error_json_1 = __importDefault(require("../constants/errors/authen.error.json"));
const winston_1 = __importDefault(require("../helpers/winston"));
const validator_1 = __importDefault(require("validator"));
const userRole_json_1 = __importDefault(require("../constants/masters/userRole.json"));
const redis_1 = require("../helpers/redis");
const validator_2 = require("../utils/validator");
const register = () => async (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        winston_1.default.error('User registration failed: Missing required fields');
        return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_USER_REGISTER_REQUIRED));
    }
    try {
        const existingUser = await models_1.UserModel.findOne({ where: { email } });
        if (existingUser) {
            return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_REGISTER_USER_EXIST));
        }
        if (!(0, validator_2.isEnglishOnly)(username)) {
            return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_REGISTER_USERNAME_INVALID));
        }
        if (!(0, validator_2.isEnglishOnly)(email) || !validator_1.default.isEmail(email)) {
            return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_REGISTER_USER_EMAIL_INVALID));
        }
        if (!validator_1.default.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })) {
            return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_REGISTER_PASSWORD_WEAK));
        }
        const newUser = await models_1.UserModel.create({ username, email, password, role_id: userRole_json_1.default.CASHIER.id });
        res.locals.newUser = newUser;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = () => async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_USER_LOGIN_REQUIRED));
    }
    try {
        const user = await models_1.UserModel.findOne({ where: { email } });
        const redis = (0, redis_1.getRedisClient)();
        if (!user) {
            return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_LOGIN_USER_INVALID));
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_LOGIN_USER_INVALID));
        }
        user.last_login = user.recent_login;
        user.recent_login = new Date();
        await user.save();
        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
        const jwtRefreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
        const header = { alg: 'HS256', typ: 'JWT' };
        const accessToken = await new jose.SignJWT({
            id: user.id,
            username: user.username,
            email: user.email,
            role_id: user.role_id
        })
            .setProtectedHeader(header)
            .setIssuedAt()
            .setExpirationTime(process.env.JWT_EXPIRES_IN)
            .sign(jwtSecret);
        const refreshToken = await new jose.SignJWT({
            id: user.id,
            username: user.username,
        })
            .setProtectedHeader(header)
            .setIssuedAt()
            .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN)
            .sign(jwtRefreshSecret);
        await redis.sAdd(`refreshTokens:${user.id}`, refreshToken);
        await redis.expire(`refreshTokens:${user.id}`, 60 * 60 * 24 * 7);
        res.locals.token = {
            accessToken,
            refreshToken
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refreshToken = () => async (req, res, next) => {
    const refreshToken = req.cookies.authToken;
    if (!refreshToken)
        return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_REFRESH_TOKEN_NOT_FOUND));
    try {
        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
        const jwtRefreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
        const { payload } = await jose.jwtVerify(refreshToken, jwtRefreshSecret);
        const userId = payload.id;
        const redis = (0, redis_1.getRedisClient)();
        const isTokenExist = await redis.sIsMember(`refreshTokens:${userId}`, refreshToken);
        if (!isTokenExist) {
            return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_REFRESH_TOKEN_NOT_FOUND));
        }
        await redis.sRem(`refreshTokens:${userId}`, refreshToken);
        const user = await models_1.UserModel.findOne({ where: { id: userId } });
        if (!user) {
            return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_LOGIN_USER_INVALID));
        }
        const newAccessToken = await new jose.SignJWT({
            id: user.id,
            username: user.username,
            email: user.email,
            role_id: user.role_id
        })
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuedAt()
            .setExpirationTime(process.env.JWT_EXPIRES_IN)
            .sign(jwtSecret);
        const newRefreshToken = await new jose.SignJWT({
            id: user.id,
            username: user.username,
        })
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuedAt()
            .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN)
            .sign(jwtRefreshSecret);
        await redis.sAdd(`refreshTokens:${userId}`, newRefreshToken);
        await redis.expire(`refreshTokens:${userId}`, 60 * 60 * 24 * 7);
        res.locals.token = {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
const logout = () => async (req, res, next) => {
    const refreshToken = req.cookies.authToken;
    const redis = (0, redis_1.getRedisClient)();
    if (!refreshToken)
        return next(new helpers_1.ServiceError(authen_error_json_1.default.ERR_REFRESH_TOKEN_NOT_FOUND));
    try {
        const jwtRefreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET);
        const { payload } = await jose.jwtVerify(refreshToken, jwtRefreshSecret);
        await redis.sRem(`refreshTokens:${payload.id}`, refreshToken);
        res.clearCookie('authToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const checkAvailability = () => async (req, res, next) => {
    const { email, username } = req.query;
    let checkExist = { emailTaken: null, usernameTaken: null };
    try {
        if (email) {
            const emailStr = email;
            const user = await models_1.UserModel.findOne({ where: { email: emailStr } });
            checkExist.emailTaken = !!user;
        }
        if (username) {
            const usernameStr = username;
            const user = await models_1.UserModel.findOne({ where: { username: usernameStr } });
            checkExist.usernameTaken = !!user;
        }
        res.locals.checkExist = checkExist;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.checkAvailability = checkAvailability;
//# sourceMappingURL=authenController.js.map