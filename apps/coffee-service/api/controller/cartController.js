"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCart = exports.updateQuantity = exports.addToCart = exports.getCartItems = void 0;
const helpers_1 = require("@coffee/helpers");
const models_1 = require("@coffee/models");
const cart_error_json_1 = __importDefault(require("../constants/errors/cart.error.json"));
const MAX_ITEM_QUANTITY = 10;
const MAX_CART_ITEMS = 50;
const getCartItems = () => async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const cartItems = await models_1.CartModel.findAll({
            where: { customer_id: customerId },
            include: [
                {
                    model: models_1.ProductModel,
                    as: 'product'
                },
                {
                    model: models_1.SizeModel,
                    as: 'size'
                }
            ]
        });
        const mappedCartItems = cartItems.map((c) => ({
            id: c.id,
            product_id: c.product.id,
            name: c.product.name,
            size: c.size.name,
            description: c.product.description,
            price: c.extra_price,
            unit_price: (Number(c.product.price) + Number(c.size.extra_price)),
            extra_price: c.extra_price,
            quantity: c.quantity,
            imageSource: c.product.image_url
        }));
        res.locals.cart = mappedCartItems;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getCartItems = getCartItems;
const addToCart = () => async (req, res, next) => {
    try {
        const customerId = req.user.id;
        if (!customerId) {
            return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_CUSTOMER_ID_REQUIRED));
        }
        const { product_id, size_id, quantity, extra_price } = req.body;
        if (!product_id) {
            return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_PRODUCT_ID_REQUIRED));
        }
        if (!size_id) {
            return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_SIZE_ID_REQUIRED));
        }
        if (!quantity) {
            return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_QUANTITY_REQUIRED));
        }
        if (!extra_price) {
            return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_EXTRA_PRICE_REQUIRED));
        }
        const cartCount = await models_1.CartModel.count({ where: { customer_id: customerId } });
        if (cartCount > MAX_CART_ITEMS) {
            return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_LIMIT_QUANTITY_FULL));
        }
        const existingItem = await models_1.CartModel.findOne({
            where: { customer_id: customerId, product_id, size_id }
        });
        let cartItem;
        if (existingItem) {
            const newQty = existingItem.quantity + quantity;
            if (newQty > MAX_ITEM_QUANTITY) {
                return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_LIMIT_QUANTITY_FULL));
            }
            existingItem.quantity = newQty;
            await existingItem.save();
            cartItem = existingItem;
        }
        else {
            if (quantity > MAX_ITEM_QUANTITY) {
                return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_LIMIT_QUANTITY_FULL));
            }
            const newItem = await models_1.CartModel.create({
                customer_id: customerId,
                product_id,
                size_id,
                quantity,
                extra_price
            });
            cartItem = newItem;
        }
        res.locals.cart = cartItem;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.addToCart = addToCart;
const updateQuantity = () => async (req, res, next) => {
    try {
        const { id, newQuantity, extra_price } = req.body;
        const cartItem = await models_1.CartModel.findByPk(id);
        if (!cartItem) {
            return next(new helpers_1.ServiceError(cart_error_json_1.default.ERR_CART_ITEM_NOT_FOUND));
        }
        cartItem.quantity = newQuantity;
        cartItem.extra_price = extra_price;
        await cartItem.save();
        res.locals.quantity = cartItem.quantity;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.updateQuantity = updateQuantity;
const deleteCart = () => async (req, res, next) => {
    try {
        const id = req.params.id;
        await models_1.CartModel.destroy({ where: { id } });
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCart = deleteCart;
//# sourceMappingURL=cartController.js.map