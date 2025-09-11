import express, { Request, Response, NextFunction } from 'express';

import { CancelOrder, createOrder, createPayment, getOrderData, getOrderHistorty, getPaymentByRefercnce, getTrackOrder, payForQR, paymentResult} from '../controller/orderController';
import { authMiddleware, authMiddlewareCustomer, findUserPermission, validateUserPermission } from '../controller/userController';
import { ORDER_MANAGEMENT } from '../constants/masters/portalPermissionMaster.json'
import { VIEW, CREATE, EDIT, DELETE } from '../constants/masters/portalPermissionActionMaster.json'

const router = express.Router()


router.get(
    '/',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(ORDER_MANAGEMENT, VIEW),
    getOrderData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                orders: res.locals.orders,
            }
        }
        res.json(res.locals.response)
        next()
    }
)





////////////Mobile//////////////////////////

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