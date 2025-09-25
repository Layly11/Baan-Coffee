"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const cartController_1 = require("../controller/cartController");
const router = express_1.default.Router();
router.get("/", (0, userController_1.authMiddlewareCustomer)(), (0, cartController_1.getCartItems)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            cart: res.locals.cart
        }
    };
    res.json(res.locals.response);
    next();
});
router.post("/", (0, userController_1.authMiddlewareCustomer)(), (0, cartController_1.addToCart)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            cart: res.locals.cart
        }
    };
    res.json(res.locals.response);
    next();
});
router.delete("/delete/:id", (0, userController_1.authMiddlewareCustomer)(), (0, cartController_1.deleteCart)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            cart: res.locals.cart
        }
    };
    res.json(res.locals.response);
    next();
});
router.patch("/update/quantity", (0, userController_1.authMiddlewareCustomer)(), (0, cartController_1.updateQuantity)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            quantity: res.locals.quantity
        }
    };
    res.json(res.locals.response);
    next();
});
exports.default = router;
//# sourceMappingURL=cartRouter.js.map