import express, { Request, Response, NextFunction } from 'express';
import {  } from '../controller/productController'
import multer from 'multer'
import {authMiddlewareCustomer} from '../controller/userController';
import { addToCart, deleteCart, getCartItems, updateQuantity } from '../controller/cartController';
const router = express.Router()


router.get(
    "/", 
    authMiddlewareCustomer(),
    getCartItems(),
     (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                cart: res.locals.cart
            }
        }
        res.json(res.locals.response)
        next()
    }
    
);


router.post(
    "/", 
    authMiddlewareCustomer(),
    addToCart(),
     (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                cart: res.locals.cart
            }
        }
        res.json(res.locals.response)
        next()
    }
    
);


router.delete(
    "/delete/:id", 
    authMiddlewareCustomer(),
    deleteCart(),
     (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                cart: res.locals.cart
            }
        }
        res.json(res.locals.response)
        next()
    }
    
);

router.patch(
    "/update/quantity", 
    authMiddlewareCustomer(),
    updateQuantity(),
     (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                quantity: res.locals.quantity
            }
        }
        res.json(res.locals.response)
        next()
    }
    
);
export default router