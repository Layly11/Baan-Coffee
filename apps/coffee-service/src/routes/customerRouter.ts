import express, { Request, Response, NextFunction } from 'express';
import { registerCustomer, loginCustomer, verifyOtpCustomer, resendOtpCustomer,checkCustomerExist, forgotPasswordWithOtp, verifyResetOtp, resendResetOtp, requireResetVerified, resetPassword } from '../controller/customersController';
import {  getOtpLimiter,getLoginLimiter, getResetOtpLimiter, getForgorPasswordLimiter, getVerifyResetOtpLimiter, getVerifyLimiter } from '../utils/ratelimit';
import { authMiddlewareCustomer } from '../controller/userController';
import { getProfileData } from '../controller/customersController';
import { RedisClientType } from 'redis';



export default function createCustomerRouter({ redis }: { redis: RedisClientType }) {
const router = express.Router()

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
            data:  {
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
