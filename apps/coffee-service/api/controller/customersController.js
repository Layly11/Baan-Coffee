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
exports.getProfileData = exports.resetPassword = exports.requireResetVerified = exports.verifyResetOtp = exports.resendResetOtp = exports.forgotPasswordWithOtp = exports.loginCustomer = exports.resendOtpCustomer = exports.verifyOtpCustomer = exports.checkCustomerExist = exports.registerCustomer = void 0;
const helpers_1 = require("@coffee/helpers");
const models_1 = require("@coffee/models");
const customer_error_json_1 = __importDefault(require("../constants/errors/customer.error.json"));
const jose = __importStar(require("jose"));
const emailUtils_1 = require("../utils/emailUtils");
const redis_1 = require("../helpers/redis");
const registerCustomer = () => async (req, res, next) => {
    const redis = (0, redis_1.getRedisClient)();
    try {
        const { name, email, password, phone } = req.body;
        const existsEmail = await models_1.CustomersModel.findOne({ where: { email } });
        if (existsEmail) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_REGISTER_EMAIL_EXIST));
        }
        const existsPhone = await models_1.CustomersModel.findOne({ where: { phone } });
        if (existsPhone) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_REGISTER_PHONE_EXIST));
        }
        if (!password) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_PASSWORD_REQUIRED));
        }
        await models_1.CustomersModel.create({
            name,
            email,
            password,
            phone,
            image_url: null,
            verified: false,
        });
        const otp = String(Math.floor(100000 + Math.random() * 900000).toString());
        await redis.set(`email_otp:${email}`, otp, { EX: 300 });
        await (0, emailUtils_1.sendOtpEmail)(email, otp);
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.registerCustomer = registerCustomer;
const checkCustomerExist = () => async (req, res, next) => {
    try {
        const { email, phone } = req.query;
        const emailExists = await models_1.CustomersModel.findOne({ where: { email } });
        const phoneExists = await models_1.CustomersModel.findOne({ where: { phone } });
        res.locals.emailExists = !!emailExists;
        res.locals.phoneExists = !!phoneExists;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.checkCustomerExist = checkCustomerExist;
const verifyOtpCustomer = () => async (req, res, next) => {
    const redis = (0, redis_1.getRedisClient)();
    try {
        const { email, otp } = req.body;
        console.log("OTP From Mobile: ", otp);
        if (!email || !otp) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_OTP_REQUIRED));
        }
        const customer = await models_1.CustomersModel.findOne({ where: { email } });
        if (!customer) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }
        if (customer.verified) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_ALREADY_VERIFIED));
        }
        const storedOtp = await redis.get(`email_otp:${email}`);
        if (!storedOtp || storedOtp !== otp)
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_OTP_INVALID));
        customer.verified = true;
        await customer.save();
        await redis.del(`email_otp:${email}`);
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.verifyOtpCustomer = verifyOtpCustomer;
const resendOtpCustomer = () => async (req, res, next) => {
    const redis = (0, redis_1.getRedisClient)();
    try {
        const { email } = req.body;
        if (!email) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_REQUIRED));
        }
        const customer = await models_1.CustomersModel.findOne({ where: { email } });
        if (!customer) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }
        const rateLimitKey = `email_otp_limit:${email}`;
        const isLimited = await redis.get(rateLimitKey);
        if (isLimited) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_OTP_TOO_MANY_ATTEMPTS));
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        await redis.set(`email_otp:${email}`, otp, { EX: 300 });
        await redis.set(rateLimitKey, '1', { EX: 60 });
        await (0, emailUtils_1.sendOtpEmail)(email, otp);
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.resendOtpCustomer = resendOtpCustomer;
const loginCustomer = () => async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_LOGIN_REQUIRED));
        }
        const customer = await models_1.CustomersModel.findOne({ where: { email } });
        if (!customer) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_LOGIN_CUSTOMER_INVALID));
        }
        const isMatch = await customer.matchPassword(password);
        if (!isMatch) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_LOGIN_CUSTOMER_INVALID));
        }
        if (!customer.verified) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_NOT_VERIFIED));
        }
        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET_CUSTOMER);
        const token = await new jose.SignJWT({
            id: customer.id,
            email: customer.email,
            name: customer.name
        })
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuedAt()
            .setExpirationTime(process.env.JWT_CUSTOMER_EXPIRES_IN)
            .sign(jwtSecret);
        res.locals.data = {
            token
        };
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.loginCustomer = loginCustomer;
const forgotPasswordWithOtp = () => async (req, res, next) => {
    const redis = (0, redis_1.getRedisClient)();
    try {
        const { email } = req.body;
        if (!email) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_REQUIRED));
        }
        const customer = await models_1.CustomersModel.findOne({ where: { email } });
        if (!customer) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const redisKey = `reset_otp:${email}`;
        await redis.set(redisKey, otp, { EX: 300 });
        await (0, emailUtils_1.sendResetPasswordEmail)(email, otp);
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPasswordWithOtp = forgotPasswordWithOtp;
const resendResetOtp = () => async (req, res, next) => {
    const redis = (0, redis_1.getRedisClient)();
    try {
        const { email } = req.body;
        if (!email) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_REQUIRED));
        }
        const customer = await models_1.CustomersModel.findOne({ where: { email } });
        if (!customer) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }
        const rateLimitKey = `reset_otp_limit:${email}`;
        const isLimited = await redis.get(rateLimitKey);
        if (isLimited) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_OTP_TOO_MANY_ATTEMPTS));
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpKey = `reset_otp:${email}`;
        await redis.set(otpKey, otp, { EX: 300 });
        await redis.set(rateLimitKey, "1", { EX: 60 });
        await (0, emailUtils_1.sendResetPasswordEmail)(email, otp);
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.resendResetOtp = resendResetOtp;
const verifyResetOtp = () => async (req, res, next) => {
    const redis = (0, redis_1.getRedisClient)();
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_OTP_REQUIRED));
        }
        const redisKey = `reset_otp:${email}`;
        const storedOtp = await redis.get(redisKey);
        if (!storedOtp) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_OTP_NOT_HAVE_IN_REDIS));
        }
        if (storedOtp !== otp) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_OTP_INVALID));
        }
        await redis.set(`reset_otp_verified:${email}`, "true", { EX: 300 });
        await redis.del(redisKey);
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.verifyResetOtp = verifyResetOtp;
const requireResetVerified = () => async (req, res, next) => {
    const redis = (0, redis_1.getRedisClient)();
    try {
        let { email } = req.body;
        if (!email) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_REQUIRED));
        }
        const allowed = await redis.get(`reset_otp_verified:${email}`);
        if (!allowed) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_OTP_NOT_VERIFIED_OR_EXPIRED));
        }
        res.locals.resetVerifiedEmail = email;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.requireResetVerified = requireResetVerified;
const resetPassword = () => async (req, res, next) => {
    try {
        const email = res.locals.resetVerifiedEmail || req.body.email;
        const { newPassword } = req.body;
        if (!newPassword) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_PASSWORD_REQUIRED));
        }
        const policy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W_]{8,}$/;
        if (!policy.test(newPassword)) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_PASSWORD_POLICY_INVALID));
        }
        const customer = await models_1.CustomersModel.findOne({ where: { email } });
        if (!customer) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }
        customer.password = newPassword;
        await customer.save();
        const redis = (0, redis_1.getRedisClient)();
        await redis.del(`reset_otp_verified:${email}`);
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.resetPassword = resetPassword;
const getProfileData = () => async (req, res, next) => {
    try {
        const user = req.user;
        const customer = await models_1.CustomersModel.findByPk(user.id);
        if (!customer) {
            return next(new helpers_1.ServiceError(customer_error_json_1.default.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }
        res.locals.customer = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            profile_img: customer.image_url
        };
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getProfileData = getProfileData;
//# sourceMappingURL=customersController.js.map