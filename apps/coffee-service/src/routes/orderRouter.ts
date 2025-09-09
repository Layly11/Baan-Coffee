import express, { Request, Response, NextFunction } from 'express';

import { CancelOrder, createOrder, createPayment, getOrderHistorty, getPaymentByRefercnce, getTrackOrder, payForQR, paymentResult} from '../controller/orderController';
import { authMiddlewareCustomer } from '../controller/userController';
import axios from 'axios'
const router = express.Router()


router.post(
    "/create/payment", 
    authMiddlewareCustomer(),
    createPayment(),
     (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                response: res.locals.response
            }
        }
        res.json(res.locals.response)
        next()
    }
    
);


router.post('/payment/result', paymentResult());

router.post(
  '/create', 
  createOrder(),
  (req: Request, res: Response, next:NextFunction) => {
    res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: undefined
        }
        res.json(res.locals.response)
        next()
  }
)


router.get(
  '/payment/:reference', 
  getPaymentByRefercnce(),
  (req: Request, res: Response, next:NextFunction) => {
    res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
              payment: res.locals.payment
            }
        }
        res.json(res.locals.response)
        next()
  }
)


router.post(
  '/payment/qr', 
  payForQR(),
  (req: Request, res: Response, next:NextFunction) => {
    res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
              response: res.locals.payment
            }
        }
        res.json(res.locals.response)
        next()
  }
)


router.get(
  '/history', 
  authMiddlewareCustomer(),
  getOrderHistorty(),
  (req: Request, res: Response, next:NextFunction) => {
    res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
              orderHistory: res.locals.orderHistory
            }
        }
        res.json(res.locals.response)
        next()
  }
)

router.get(
  '/trackOrder', 
  authMiddlewareCustomer(),
  getTrackOrder(),
  (req: Request, res: Response, next:NextFunction) => {
    res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
              order: res.locals.latestOrder
            }
        }
        res.json(res.locals.response)
        next()
  }
)


router.post(
  '/cancel',
  authMiddlewareCustomer(),
  CancelOrder(),
    (req: Request, res: Response, next:NextFunction) => {
       res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: undefined
        }
        res.json(res.locals.response)
        next()
    }
)
export default router