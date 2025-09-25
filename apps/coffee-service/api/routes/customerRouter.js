"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createCustomerRouter;
const express_1 = __importDefault(require("express"));
const customersController_1 = require("../controller/customersController");
const ratelimit_1 = require("../utils/ratelimit");
const userController_1 = require("../controller/userController");
const customersController_2 = require("../controller/customersController");
const portalPermissionMaster_json_1 = require("../constants/masters/portalPermissionMaster.json");
const portalPermissionActionMaster_json_1 = require("../constants/masters/portalPermissionActionMaster.json");
function createCustomerRouter({ redis }) {
    const router = express_1.default.Router();
    router.get('/', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_CUSTOMER, portalPermissionActionMaster_json_1.VIEW), (0, customersController_1.getCustomerData)(), (req, res, next) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                total: res.locals.total,
                customers: res.locals.customers
            }
        };
        res.json(res.locals.response);
        next();
    });
    router.get('/order/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_CUSTOMER, portalPermissionActionMaster_json_1.VIEW), (0, customersController_1.getCustomerOrderData)(), (req, res, next) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                total: res.locals.total,
                orders: res.locals.orders
            }
        };
        res.json(res.locals.response);
        next();
    });
    router.patch('/update/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_CUSTOMER, portalPermissionActionMaster_json_1.EDIT), (0, customersController_1.updateCustomerData)(), (req, res, next) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.delete('/delete/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_CUSTOMER, portalPermissionActionMaster_json_1.DELETE), (0, customersController_1.deleteCustomer)(), (req, res, next) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.post('/register', (0, customersController_1.registerCustomer)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: 'Register Successfully',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.get('/check-customer', (0, customersController_1.checkCustomerExist)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                emailExists: res.locals.emailExists,
                phoneExists: res.locals.phoneExists
            }
        };
        res.json(res.locals.response);
        next();
    });
    router.post('/verify-otp', (0, ratelimit_1.getVerifyLimiter)(redis), (0, customersController_1.verifyOtpCustomer)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: 'Verify OTP Success!!',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.post('/resend-otp', (0, ratelimit_1.getOtpLimiter)(redis), (0, customersController_1.resendOtpCustomer)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: 'OTP Resent Successfully',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.post('/login', (0, ratelimit_1.getLoginLimiter)(redis), (0, customersController_1.loginCustomer)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: 'Login Successfully',
            data: {
                data: res.locals.data
            }
        };
        res.json(res.locals.response);
        next();
    });
    router.post('/forgot-password', (0, ratelimit_1.getForgorPasswordLimiter)(redis), (0, customersController_1.forgotPasswordWithOtp)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.post('/resend-reset-otp', (0, ratelimit_1.getResetOtpLimiter)(redis), (0, customersController_1.resendResetOtp)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.post('/verify-reset-otp', (0, ratelimit_1.getVerifyResetOtpLimiter)(redis), (0, customersController_1.verifyResetOtp)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: 'OTP verified successfully',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.post('/reset-password', (0, customersController_1.requireResetVerified)(), (0, customersController_1.resetPassword)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: undefined
        };
        res.json(res.locals.response);
        next();
    });
    router.get('/profile', (0, userController_1.authMiddlewareCustomer)(), (0, customersController_2.getProfileData)(), (req, res, next) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                customer: res.locals.customer
            }
        };
        res.json(res.locals.response);
        next();
    });
    return router;
}
//# sourceMappingURL=customerRouter.js.map