"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controller/orderController");
const userController_1 = require("../controller/userController");
const portalPermissionMaster_json_1 = require("../constants/masters/portalPermissionMaster.json");
const portalPermissionActionMaster_json_1 = require("../constants/masters/portalPermissionActionMaster.json");
const router = express_1.default.Router();
router.get('/', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.ORDER_MANAGEMENT, portalPermissionActionMaster_json_1.VIEW), (0, orderController_1.getOrderData)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            orders: res.locals.orders,
            total: res.locals.total
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/status/cancel', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.ORDER_MANAGEMENT, portalPermissionActionMaster_json_1.EDIT), (0, orderController_1.CancelOrderStatus)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.post('/status/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.ORDER_MANAGEMENT, portalPermissionActionMaster_json_1.EDIT), (0, orderController_1.updateOrderStatus)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.get('/invoice/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.ORDER_MANAGEMENT, portalPermissionActionMaster_json_1.VIEW), (0, orderController_1.getInvoiceData)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            invoice: res.locals.invoice
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/notification', (0, orderController_1.createNotifyOrder)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.post("/create/payment", (0, userController_1.authMiddlewareCustomer)(), (0, orderController_1.createPayment)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            response: res.locals.response
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/payment/result', (0, orderController_1.paymentResult)());
router.post('/create', (0, orderController_1.createOrder)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.get('/payment/:reference', (0, orderController_1.getPaymentByRefercnce)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            payment: res.locals.payment
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/payment/qr', (0, orderController_1.payForQR)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            response: res.locals.payment
        }
    };
    res.json(res.locals.response);
    next();
});
router.get('/history', (0, userController_1.authMiddlewareCustomer)(), (0, orderController_1.getOrderHistorty)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            orderHistory: res.locals.orderHistory
        }
    };
    res.json(res.locals.response);
    next();
});
router.get('/trackOrder', (0, userController_1.authMiddlewareCustomer)(), (0, orderController_1.getTrackOrder)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            order: res.locals.latestOrder
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/cancel', (0, userController_1.authMiddlewareCustomer)(), (0, orderController_1.CancelOrder)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.get('/notification', (0, userController_1.authMiddlewareCustomer)(), (0, orderController_1.getNotifyOrder)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            notification: res.locals.notification
        }
    };
    res.json(res.locals.response);
    next();
});
exports.default = router;
//# sourceMappingURL=orderRouter.js.map