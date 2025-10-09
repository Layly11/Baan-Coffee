import express, { Request, Response, NextFunction } from 'express';

import { CancelOrder, CancelOrderStatus, createNotifyOrder, createOrder, createPayment, DownloadInvoice, getInvoiceData, getNotifyOrder, getOrderData, getOrderHistorty, getPaymentByRefercnce, getTrackOrder, payForQR, paymentResult, updateOrderStatus } from '../controller/orderController';
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
        total: res.locals.total
      }
    }
    res.json(res.locals.response)
    next()
  }
)

router.post(
  '/status/cancel',
  authMiddleware(),
  findUserPermission(),
  validateUserPermission(ORDER_MANAGEMENT, EDIT),
  CancelOrderStatus(),
  (req: Request, res: Response, next: NextFunction) => {
    res.locals.response = {
      res_code: '1111',
      res_desc: '',
      data: undefined
    }
    res.json(res.locals.response)
    next()
  }
)

router.post(
  '/status/:id',
  authMiddleware(),
  findUserPermission(),
  validateUserPermission(ORDER_MANAGEMENT, EDIT),
  updateOrderStatus(),
  (req: Request, res: Response, next: NextFunction) => {
    res.locals.response = {
      res_code: '0000',
      res_desc: '',
      data: undefined
    }
    res.json(res.locals.response)
    next()
  }
)

router.get(
  '/invoice/:id',
  authMiddleware(),
  findUserPermission(),
  validateUserPermission(ORDER_MANAGEMENT, VIEW),
  getInvoiceData(),
  (req: Request, res: Response, next: NextFunction) => {
    res.locals.response = {
      res_code: '0000',
      res_desc: '',
      data: {
        invoice: res.locals.invoice
      }
    }
    res.json(res.locals.response)
    next()
  }
)

router.post(
  '/notification',
  createNotifyOrder(),
  (req: Request, res: Response, next: NextFunction) => {
    res.locals.response = {
      res_code: '0000',
      res_desc: '',
      data: undefined
    }
    res.json(res.locals.response)
    next()
  }
)
router.post(
  '/download-invoice/:id',
  authMiddleware(),
  findUserPermission(),
  validateUserPermission(ORDER_MANAGEMENT, EDIT),
  DownloadInvoice(),
  (req: Request, res: Response, next: NextFunction) => {
    res.locals.response = {
      res_code: '0000',
      res_desc: '',
      data: undefined
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
  (req: Request, res: Response, next: NextFunction) => {
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
  (req: Request, res: Response, next: NextFunction) => {
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
  (req: Request, res: Response, next: NextFunction) => {
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
  (req: Request, res: Response, next: NextFunction) => {
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
  (req: Request, res: Response, next: NextFunction) => {
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
  (req: Request, res: Response, next: NextFunction) => {
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
  '/notification',
  authMiddlewareCustomer(),
  getNotifyOrder(),
  (req: Request, res: Response, next: NextFunction) => {
    res.locals.response = {
      res_code: '0000',
      res_desc: '',
      data: {
        notification: res.locals.notification
      }
    }
    res.json(res.locals.response)
    next()
  }
)

export default router