import express, { Request, Response, NextFunction } from 'express';
import { registerCustomer, loginCustomer, verifyOtpCustomer, resendOtpCustomer, checkCustomerExist, forgotPasswordWithOtp, verifyResetOtp, resendResetOtp, requireResetVerified, resetPassword, getCustomerData, getCustomerOrderData, updateCustomerData, deleteCustomer } from '../controller/customersController';
import { getOtpLimiter, getLoginLimiter, getResetOtpLimiter, getForgorPasswordLimiter, getVerifyResetOtpLimiter, getVerifyLimiter } from '../utils/ratelimit';
import { authMiddleware, authMiddlewareCustomer, findUserPermission, validateUserPermission } from '../controller/userController';
import { getProfileData } from '../controller/customersController';
import { RedisClientType } from 'redis';
import { MANAGE_CUSTOMER } from '../constants/masters/portalPermissionMaster.json'
import { VIEW, CREATE, EDIT, DELETE } from '../constants/masters/portalPermissionActionMaster.json'

export default function createCustomerRouter({ redis }: { redis: RedisClientType }) {
    const router = express.Router()


    router.get(
        '/',
        authMiddleware(),
        findUserPermission(),
        validateUserPermission(MANAGE_CUSTOMER, VIEW),
        getCustomerData(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '0000',
                res_desc: '',
                data: {
                    total: res.locals.total,
                    customers: res.locals.customers
                }
            }
            res.json(res.locals.response)
            next()
        }
    )

    router.get(
        '/order/:id',
        authMiddleware(),
        findUserPermission(),
        validateUserPermission(MANAGE_CUSTOMER, VIEW),
        getCustomerOrderData(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '0000',
                res_desc: '',
                data: {
                    total: res.locals.total,
                    orders: res.locals.orders
                }
            }
            res.json(res.locals.response)
            next()
        }
    )
    router.get(
        '/',
        authMiddleware(),
        findUserPermission(),
        validateUserPermission(MANAGE_CUSTOMER, VIEW),
        getCustomerData(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '0000',
                res_desc: '',
                data: {
                    total: res.locals.total,
                    customers: res.locals.customers
                }
            }
            res.json(res.locals.response)
            next()
        }
    )
    router.patch(
        '/update/:id',
        authMiddleware(),
        findUserPermission(),
        validateUserPermission(MANAGE_CUSTOMER, VIEW),
        updateCustomerData(),
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


    router.delete(
        '/delete/:id',
        authMiddleware(),
        findUserPermission(),
        validateUserPermission(MANAGE_CUSTOMER, VIEW),
        deleteCustomer(),
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









    /////////////////////Mobile////////////////////




    router.post(
        '/register',
        registerCustomer(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '1111',
                res_desc: 'Register Successfully',
                data: undefined
            }
            res.json(res.locals.response)
            next()
        }
    )


    router.get(
        '/check-customer',
        checkCustomerExist(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '1111',
                res_desc: '',
                data: {
                    emailExists: res.locals.emailExists,
                    phoneExists: res.locals.phoneExists
                }
            }
            res.json(res.locals.response)
            next()
        }
    )



    router.post(
        '/verify-otp',
        getVerifyLimiter(redis),
        verifyOtpCustomer(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '1111',
                res_desc: 'Verify OTP Success!!',
                data: undefined
            }
            res.json(res.locals.response)
            next()
        }
    )

    router.post(
        '/resend-otp',
        getOtpLimiter(redis),
        resendOtpCustomer(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '1111',
                res_desc: 'OTP Resent Successfully',
                data: undefined
            }
            res.json(res.locals.response)
            next()
        }
    );

    router.post(
        '/login',
        getLoginLimiter(redis),
        loginCustomer(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '1111',
                res_desc: 'Login Successfully',
                data: {
                    data: res.locals.data
                }
            }
            res.json(res.locals.response)
            next()
        }
    )


    router.post(
        '/forgot-password',
        getForgorPasswordLimiter(redis),
        forgotPasswordWithOtp(),
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
        '/resend-reset-otp',
        getResetOtpLimiter(redis),
        resendResetOtp(),
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
        '/verify-reset-otp',
        getVerifyResetOtpLimiter(redis),
        verifyResetOtp(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '1111',
                res_desc: 'OTP verified successfully',
                data: undefined
            }
            res.json(res.locals.response)
            next()
        }
    )


    router.post(
        '/reset-password',
        requireResetVerified(),
        resetPassword(),
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
        '/profile',
        authMiddlewareCustomer(),
        getProfileData(),
        (req: Request, res: Response, next: NextFunction) => {
            res.locals.response = {
                res_code: '1111',
                res_desc: '',
                data: {
                    customer: res.locals.customer
                }
            }
            res.json(res.locals.response)
            next()
        }
    )
    return router
}
