import express, { Request, Response, NextFunction } from 'express';
import { registerCustomer, loginCustomer, verifyOtpCustomer, resendOtpCustomer } from '../controller/customersController';
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


router.post(
    '/verify-otp',
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
export default router