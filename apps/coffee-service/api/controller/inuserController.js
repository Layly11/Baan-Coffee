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
exports.resetPasswordUser = exports.createUserData = exports.deleteUserData = exports.updateUserData = exports.getUserData = void 0;
const helpers_1 = require("@coffee/helpers");
const models_1 = require("@coffee/models");
const sequelize_1 = require("sequelize");
const jose = __importStar(require("jose"));
const user_error_json_1 = __importDefault(require("../constants/errors/user.error.json"));
const redis_1 = require("../helpers/redis");
const emailUtils_1 = require("../utils/emailUtils");
const createAuditLog_1 = require("../constants/commons/createAuditLog");
const getUserData = () => async (req, res, next) => {
    const { audit_action: auditAction, information, role, limit, offset } = req.query;
    try {
        const infoStr = typeof information === 'string' ? information : undefined;
        const roles = Array.isArray(role) ? role : role ? [role] : [];
        const roleIds = roles.map(r => Number(r)).filter(r => !isNaN(r));
        const portal = req.user;
        const where = infoStr
            ? {
                ...(roleIds.length > 0 && { role_id: { [sequelize_1.Op.in]: roleIds } }),
                [sequelize_1.Op.or]: [
                    { username: { [sequelize_1.Op.like]: `%${infoStr}%` } },
                    { email: { [sequelize_1.Op.like]: `%${infoStr}%` } },
                ],
            }
            : { ...(roleIds.length > 0 && { role_id: { [sequelize_1.Op.in]: roleIds } }), };
        const { count, rows } = await models_1.UserModel.findAndCountAll({
            where,
            include: [
                {
                    model: models_1.UserRoleModel,
                    as: 'role'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
        });
        const users = rows.map((u) => {
            const user = u.get({ plain: true });
            return {
                ...user,
                time: (0, helpers_1.dayjs)(user.createdAt).format('DD/MM/YYYY HH:mm'),
                last_login: user.last_login
                    ? (0, helpers_1.dayjs)(user.last_login).format('DD/MM/YYYY HH:mm')
                    : '-',
                recent_login: user.recent_login ? (0, helpers_1.dayjs)(user.recent_login).format('DD/MM/YYYY HH:mm')
                    : 'Never logged in',
                role: user.role.name
            };
        });
        if (auditAction) {
            res.locals.audit = (0, createAuditLog_1.CreateAuditLog)({
                menu: createAuditLog_1.AuditLogMenuType.USERS,
                action: auditAction,
                editorName: portal.username,
                editorRole: portal.role.name,
                eventDateTime: new Date(),
                staffId: portal.id,
                staffEmail: portal.email,
                channel: req.headers['x-original-forwarded-for']?.split(',')[0].split(':')[0] || req.ip,
                searchCriteria: JSON.stringify({ query: req.query }),
                previousValues: undefined,
                newValues: undefined,
                recordKeyValues: undefined,
                isPii: true
            });
        }
        res.locals.total = count;
        res.locals.users = users;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getUserData = getUserData;
const updateUserData = () => async (req, res, next) => {
    const id = req.params.id;
    const { username, email, role, status } = req.body;
    const currentUser = req.user;
    try {
        const user = await models_1.UserModel.findByPk(id);
        if (!user) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.USER_NOT_FOUND));
        }
        const previousValues = {
            username: user.username,
            email: user.email,
            role: user.role_id,
            status: user.status
        };
        if (currentUser.role_id === 2) {
            if (role === 1 || role === 2) {
                return next(new helpers_1.ServiceError(user_error_json_1.default.ERR_ADMIN_PERMISSION));
            }
        }
        if (username !== '' && username !== null && username !== undefined) {
            user.username = username;
        }
        if (email !== '' && email !== null && email !== undefined) {
            const userExist = await models_1.UserModel.findOne({ where: { email } });
            if (userExist && userExist.id !== user.id) {
                return next(new helpers_1.ServiceError(user_error_json_1.default.EMAIL_IS_EXISTS));
            }
            user.email = email;
        }
        if (role !== '' && role !== null && role !== undefined) {
            user.role_id = role;
        }
        if (status !== '' && status !== null && status !== undefined) {
            user.status = status;
        }
        await user.save();
        res.locals.audit = (0, createAuditLog_1.CreateAuditLog)({
            menu: createAuditLog_1.AuditLogMenuType.USERS,
            action: createAuditLog_1.AuditLogActionType.EDIT_USER,
            editorName: currentUser.username,
            editorRole: currentUser.role.name,
            targetName: previousValues.username,
            eventDateTime: new Date(),
            staffId: currentUser.id,
            staffEmail: currentUser.email,
            channel: req.headers['x-original-forwarded-for']?.split(',')[0].split(':')[0] || req.ip,
            searchCriteria: undefined,
            previousValues: JSON.stringify(previousValues),
            newValues: JSON.stringify(req.body),
            recordKeyValues: undefined,
            isPii: true
        });
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.updateUserData = updateUserData;
const deleteUserData = () => async (req, res, next) => {
    const id = req.params.id;
    const currentUser = req.user;
    try {
        const user = await models_1.UserModel.findByPk(id);
        if (!user) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.USER_NOT_FOUND));
        }
        const targetName = user.username;
        if (currentUser.id === user.id) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.CAN_NOT_DELETE_OWN_ACCOUNT));
        }
        if (currentUser.role_id === 1) {
            await user.destroy();
            res.locals.audit = (0, createAuditLog_1.CreateAuditLog)({
                menu: createAuditLog_1.AuditLogMenuType.USERS,
                action: createAuditLog_1.AuditLogActionType.DELETE_USER,
                editorName: currentUser.username,
                editorRole: currentUser.role.name,
                targetName,
                eventDateTime: new Date(),
                staffId: currentUser.id,
                staffEmail: currentUser.email,
                channel: req.headers['x-original-forwarded-for']?.split(',')[0].split(':')[0] || req.ip,
                searchCriteria: undefined,
                previousValues: undefined,
                newValues: undefined,
                recordKeyValues: undefined,
                isPii: true
            });
            return next();
        }
        if (currentUser.role_id === 2) {
            if (user.role_id === 1 || user.role_id === 2) {
                return next(new helpers_1.ServiceError(user_error_json_1.default.CAN_NOT_DELETE_SUPER_ADMIN));
            }
            await user.destroy();
            res.locals.audit = (0, createAuditLog_1.CreateAuditLog)({
                menu: createAuditLog_1.AuditLogMenuType.USERS,
                action: createAuditLog_1.AuditLogActionType.DELETE_USER,
                editorName: currentUser.username,
                editorRole: currentUser.role.name,
                targetName,
                eventDateTime: new Date(),
                staffId: currentUser.id,
                staffEmail: currentUser.email,
                channel: req.headers['x-original-forwarded-for']?.split(',')[0].split(':')[0] || req.ip,
                searchCriteria: undefined,
                previousValues: undefined,
                newValues: undefined,
                recordKeyValues: undefined,
                isPii: true
            });
            return next();
        }
        return next(new helpers_1.ServiceError(user_error_json_1.default.NOT_HAVE_PERMISSION_DELETE));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUserData = deleteUserData;
const createUserData = () => async (req, res, next) => {
    const { username, email, password, role, status } = req.body;
    const currentUser = req.user;
    try {
        if (!username) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.USERNAME_NOT_FOUND));
        }
        if (!email) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.EMAIL_NOT_FOUND));
        }
        if (!password) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.PASSSWORD_NOT_FOUND));
        }
        if (!role) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.ROLE_NOT_FOUND));
        }
        if (currentUser.role_id === 2) {
            if (role === 1 || role === 2) {
                return next(new helpers_1.ServiceError(user_error_json_1.default.ERR_ADMIN_PERMISSION));
            }
        }
        const emailExists = await models_1.UserModel.findOne({ where: { email } });
        if (emailExists) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.EMAIL_IS_EXISTS));
        }
        await models_1.UserModel.create({
            username,
            email,
            password,
            role_id: role,
            status
        });
        res.locals.audit = (0, createAuditLog_1.CreateAuditLog)({
            menu: createAuditLog_1.AuditLogMenuType.USERS,
            action: createAuditLog_1.AuditLogActionType.CREATE_USER,
            editorName: currentUser.username,
            editorRole: currentUser.role.name,
            targetName: username,
            eventDateTime: new Date(),
            staffId: currentUser.id,
            staffEmail: currentUser.email,
            channel: req.headers['x-original-forwarded-for']?.split(',')[0].split(':')[0] || req.ip,
            searchCriteria: undefined,
            previousValues: undefined,
            newValues: undefined,
            recordKeyValues: JSON.stringify({
                username,
                email,
                password,
                role_id: role,
                status
            }),
            isPii: true
        });
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.createUserData = createUserData;
const resetPasswordUser = () => async (req, res, next) => {
    const { id } = req.params;
    const redis = (0, redis_1.getRedisClient)();
    const portal = req.user;
    try {
        const user = await models_1.UserModel.findOne({
            where: {
                id,
                status: true
            }
        });
        if (!user) {
            return next(new helpers_1.ServiceError(user_error_json_1.default.USER_NOT_FOUND));
        }
        const targetName = user.username;
        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new jose.SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("15m")
            .sign(jwtSecret);
        await redis.set(`reset_token:${token}`, user.id, { EX: 15 * 60 });
        const resetLink = `http://localhost:9301/reset-password?token=${token}`;
        await (0, emailUtils_1.sendResetPasswordAdmin)(user.email, resetLink);
        res.locals.audit = (0, createAuditLog_1.CreateAuditLog)({
            menu: createAuditLog_1.AuditLogMenuType.USERS,
            action: createAuditLog_1.AuditLogActionType.RESET_PASSWORD_USER,
            editorName: portal.username,
            editorRole: portal.role.name,
            targetName,
            eventDateTime: new Date(),
            staffId: portal.id,
            staffEmail: portal.email,
            channel: req.headers['x-original-forwarded-for']?.split(',')[0].split(':')[0] || req.ip,
            searchCriteria: JSON.stringify({ query: req.query }),
            previousValues: undefined,
            newValues: undefined,
            recordKeyValues: undefined,
            isPii: true
        });
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.resetPasswordUser = resetPasswordUser;
//# sourceMappingURL=inuserController.js.map