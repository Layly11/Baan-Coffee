"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserPermission = exports.findUserPermission = exports.authMiddlewareCustomer = exports.authMiddleware = void 0;
const helpers_1 = require("@coffee/helpers");
const httpError_json_1 = __importDefault(require("../constants/errors/httpError.json"));
const models_1 = require("@coffee/models");
const jose_1 = require("jose");
const authMiddleware = () => async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ res_desc: 'Unauthorized' });
    }
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, jwtSecret);
        const user = await models_1.UserModel.findOne({
            where: { id: payload.id, status: true },
            attributes: ['id', 'username', 'email', 'role_id', 'last_login', 'recent_login'],
            include: [
                {
                    model: models_1.UserRoleModel,
                    as: 'role',
                    attributes: ['name']
                }
            ]
        });
        req.user = user;
        next();
    }
    catch (err) {
        return next(new helpers_1.ServiceError(httpError_json_1.default.ERR_HTTP_401));
    }
};
exports.authMiddleware = authMiddleware;
const authMiddlewareCustomer = () => async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ res_desc: 'Unauthorized' });
    }
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET_CUSTOMER);
    try {
        const { payload } = await (0, jose_1.jwtVerify)(token, jwtSecret);
        const exists = await models_1.CustomersModel.findOne({
            where: {
                id: payload.id,
                isDeleted: false
            }
        });
        if (!exists) {
            return next(new helpers_1.ServiceError(httpError_json_1.default.ERR_HTTP_401));
        }
        req.user = exists;
        next();
    }
    catch (err) {
        if (err instanceof jose_1.errors.JWTExpired) {
            return res.status(401).json({
                res_desc: 'Token expired',
                res_code: '0401'
            });
        }
        return next(err);
    }
};
exports.authMiddlewareCustomer = authMiddlewareCustomer;
const findUserPermission = () => async (req, res, next) => {
    const user = req.user;
    if (!user)
        return next(new helpers_1.ServiceError(httpError_json_1.default.ERR_HTTP_401));
    const query = {
        include: [
            {
                model: models_1.MenuPermissionModel,
                as: 'menu',
                required: true
            }
        ],
        where: {
            role_id: user.role_id
        }
    };
    try {
        const permissionMapping = await models_1.MapUserPermissionModel.findAll(query);
        res.locals.permissions = permissionMapping.map((permission) => {
            const permissionArray = {
                name: permission.menu.name,
                view: permission.view,
                create: permission.create,
                edit: permission.edit,
                delete: permission.delete
            };
            return permissionArray;
        });
        const formatUser = {
            id: user.id,
            role: user.role.name,
            username: user.username,
            email: user.email,
            last_login: user.last_login,
            recent_login: user.recent_login,
            permissions: res.locals.permissions
        };
        res.locals.user = formatUser;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.findUserPermission = findUserPermission;
const validateUserPermission = (name, action) => {
    return (req, res, next) => {
        try {
            const permission = res.locals.permissions.find((permission) => permission.name === name);
            if (!permission?.[action.toLowerCase()]) {
                return next(new helpers_1.ServiceError(httpError_json_1.default.ERR_HTTP_403));
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.validateUserPermission = validateUserPermission;
//# sourceMappingURL=userController.js.map