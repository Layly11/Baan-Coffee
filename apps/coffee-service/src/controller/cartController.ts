import { ServiceError } from "@coffee/helpers";
import { CartModel, ProductModel, SizeModel } from "@coffee/models";
import { NextFunction, Request, Response } from "express";
import CartMasterError from '../constants/errors/cart.error.json'


const MAX_ITEM_QUANTITY = 10;
const MAX_CART_ITEMS = 50;


export const getCartItems = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req.user as any).id

        const cartItems = await CartModel.findAll(
            {
                where: { customer_id: customerId },
                include: [
                    {
                        model: ProductModel,
                        as: 'product'
                    },
                    {
                        model: SizeModel,
                        as: 'size'
                    }
                ]
            }
        )

        

        const mappedCartItems = cartItems.map((c: any) => (
            {
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
            }
        ))

        res.locals.cart = mappedCartItems

        return next()
    } catch (err) {
        next(err)
    }
}

export const addToCart = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req.user as any).id
        if (!customerId) {
            return next(new ServiceError(CartMasterError.ERR_CUSTOMER_ID_REQUIRED))
        }

        const { product_id, size_id, quantity, extra_price } = req.body

        if (!product_id) {
            return next(new ServiceError(CartMasterError.ERR_PRODUCT_ID_REQUIRED))
        }

        if (!size_id) {
            return next(new ServiceError(CartMasterError.ERR_SIZE_ID_REQUIRED))
        }
        if (!quantity) {
            return next(new ServiceError(CartMasterError.ERR_QUANTITY_REQUIRED))
        }
        if (!extra_price) {
            return next(new ServiceError(CartMasterError.ERR_EXTRA_PRICE_REQUIRED))
        }

        const cartCount = await CartModel.count({ where: { customer_id: customerId } })

        if (cartCount > MAX_CART_ITEMS) {
            return next(new ServiceError(CartMasterError.ERR_LIMIT_QUANTITY_FULL))
        }


        const existingItem = await CartModel.findOne({
            where: { customer_id: customerId, product_id, size_id }
        });

        let cartItem
        if (existingItem) {
            const newQty = existingItem.quantity + quantity
            if (newQty > MAX_ITEM_QUANTITY) {
                return next(new ServiceError(CartMasterError.ERR_LIMIT_QUANTITY_FULL))
            }

            existingItem.quantity = newQty
            await existingItem.save();
            cartItem = existingItem
        } else {
            if (quantity > MAX_ITEM_QUANTITY) {
                return next(new ServiceError(CartMasterError.ERR_LIMIT_QUANTITY_FULL))
            }

            const newItem = await CartModel.create(
                {
                    customer_id: customerId,
                    product_id,
                    size_id,
                    quantity,
                    extra_price
                }
            )

            cartItem = newItem
        }

        res.locals.cart = cartItem

        return next()
    } catch (err) {
        next(err)
    }
}


export const updateQuantity = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, newQuantity, extra_price } = req.body

        const cartItem = await CartModel.findByPk(id)

        if (!cartItem) {
            return next(new ServiceError(CartMasterError.ERR_CART_ITEM_NOT_FOUND))
        }
        cartItem.quantity = newQuantity
        cartItem.extra_price = extra_price
        await cartItem.save()
        
        res.locals.quantity = cartItem.quantity
        return next()
    } catch (err) {
        next(err)
    }
}

export const deleteCart = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        await CartModel.destroy({ where: { id } })

        return next()
    } catch (err) {
        next(err)
    }
}