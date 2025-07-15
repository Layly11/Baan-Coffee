import express, { Request, Response, NextFunction } from 'express';
import { getProductData } from '../controller/productController'

const router = express.Router()

router.get(
    '/',
    getProductData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                products:  res.locals.products
            }
        }
        res.json(res.locals.response)
        next()
    }
)
export default router