"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createRouters;
const express_1 = require("express");
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const dashboardRouter_1 = __importDefault(require("./routes/dashboardRouter"));
const productRouter_1 = __importDefault(require("./routes/productRouter"));
const profileRouter_1 = __importDefault(require("./routes/profileRouter"));
const cartRouter_1 = __importDefault(require("./routes/cartRouter"));
const orderRouter_1 = __importDefault(require("./routes/orderRouter"));
const customerRouter_1 = __importDefault(require("./routes/customerRouter"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
function createRouters({ redis }) {
    const router = (0, express_1.Router)();
    router.use('/authen', authRouter_1.default);
    router.use('/dashboard', dashboardRouter_1.default);
    router.use('/products', productRouter_1.default);
    router.use('/customer', (0, customerRouter_1.default)({ redis }));
    router.use('/profile', profileRouter_1.default);
    router.use('/cart', cartRouter_1.default);
    router.use('/order', orderRouter_1.default);
    router.use('/user', userRouter_1.default);
    return router;
}
//# sourceMappingURL=routers.js.map