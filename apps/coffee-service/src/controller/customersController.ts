import { ServiceError } from '@coffee/helpers';
import { CustomersModel } from '@coffee/models'
import e, { NextFunction, Request, Response } from "express"
import CustomerMasterError from '../constants/errors/customer.error.json'
import * as jose from 'jose'
import { sendOtpEmail, sendResetPasswordEmail } from '../utils/emailUtils';
import { getRedisClient } from '../helpers/redis';

export const registerCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient()
    try {
        const { name, email, password, phone } = req.body

        const existsEmail = await CustomersModel.findOne({ where: { email } });
        if (existsEmail) {
            return next(new ServiceError(CustomerMasterError.ERR_REGISTER_EMAIL_EXIST))

        }

        const existsPhone = await CustomersModel.findOne({ where: { phone } });
        if (existsPhone) {
            return next(new ServiceError(CustomerMasterError.ERR_REGISTER_PHONE_EXIST))

        }

        await CustomersModel.create(
            {
                name,
                email,
                password,
                phone,
                verified: false,
            }
        )
        const otp = String(Math.floor(100000 + Math.random() * 900000).toString());
        await redis.set(`email_otp:${email}`, otp, { EX: 300 });
        await sendOtpEmail(email, otp);

        return next()
    } catch (err) {
        next(err)
    }
}

export const checkCustomerExist = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, phone } = req.query as any;

        const emailExists = await CustomersModel.findOne({ where: { email } })
        const phoneExists = await CustomersModel.findOne({ where: { phone } });

        res.locals.emailExists = !!emailExists
        res.locals.phoneExists = !!phoneExists

        return next()
    } catch (err) {
        next(err)
    }
};


export const verifyOtpCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient()
    try {
        const { email, otp } = req.body;

        console.log("OTP From Mobile: ", otp)
        if (!email || !otp) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_OTP_REQUIRED));
        }

        const customer = await CustomersModel.findOne({ where: { email } });

        if (!customer) {
            return next(
                new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND)
            );
        }

        if (customer.verified) {
            return next(
                new ServiceError(CustomerMasterError.ERR_CUSTOMER_ALREADY_VERIFIED)
            );
        }

        const storedOtp = await redis.get(`email_otp:${email}`);
        if (!storedOtp || storedOtp !== otp) return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_OTP_INVALID));

        customer.verified = true;
        await customer.save()
        await redis.del(`email_otp:${email}`);
        return next()
    } catch (err) {
        next(err)
    }
}


export const resendOtpCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient()
    try {
        const { email } = req.body;

        if (!email) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_REQUIRED));
        }

        const customer = await CustomersModel.findOne({ where: { email } });
        if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }

        const rateLimitKey = `email_otp_limit:${email}`;
        const isLimited = await redis.get(rateLimitKey);
        if (isLimited) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_OTP_TOO_MANY_ATTEMPTS));
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        await redis.set(`email_otp:${email}`, otp, { EX: 300 });
        await redis.set(rateLimitKey, '1', { EX: 60 });
        await sendOtpEmail(email, otp);

        return next();
    } catch (err) {
        next(err)
    }

}
export const loginCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_LOGIN_REQUIRED))
        }

        const customer = await CustomersModel.findOne({ where: { email } })
        if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_LOGIN_CUSTOMER_INVALID))
        }

        const isMatch = await customer.matchPassword(password)
        if (!isMatch) {
            return next(new ServiceError(CustomerMasterError.ERR_LOGIN_CUSTOMER_INVALID))
        }


        if (!customer.verified) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_NOT_VERIFIED));
        }

        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET_CUSTOMER)
        const token = await new jose.SignJWT({
            id: customer.id,
            email: customer.email,
            name: customer.name
        })
            .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
            .setIssuedAt()
            .setExpirationTime(process.env.JWT_CUSTOMER_EXPIRES_IN!)
            .sign(jwtSecret)

        res.locals.data = {
            token,
            customer: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            }
        }
        return next()

    } catch (err) {
        next(err)
    }
}


export const forgotPasswordWithOtp = () => async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient()
    try {
        const { email } = req.body

        if (!email) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_REQUIRED));
        }

        const customer = await CustomersModel.findOne({ where: { email } })

        if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const redisKey = `reset_otp:${email}`
        await redis.set(redisKey, otp, { EX: 300 });

        await sendResetPasswordEmail(email, otp)

        return next()
    } catch (err) {
        next(err)
    }
}

export const resendResetOtp = () => async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient()
    try {
        const { email } = req.body

        if (!email) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_REQUIRED));
        }

        const customer = await CustomersModel.findOne({ where: { email } })

        if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }

        const rateLimitKey = `reset_otp_limit:${email}`;
        const isLimited = await redis.get(rateLimitKey);
        if (isLimited) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_OTP_TOO_MANY_ATTEMPTS));
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpKey = `reset_otp:${email}`;

        await redis.set(otpKey, otp, { EX: 300 });
        await redis.set(rateLimitKey, "1", { EX: 60 });

        await sendResetPasswordEmail(email, otp)

        return next()
    } catch (err) {
        next(err)
    }
}


export const verifyResetOtp = () => async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient()
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_OTP_REQUIRED));
        }

        const redisKey = `reset_otp:${email}`;
        const storedOtp = await redis.get(redisKey)

        if (!storedOtp) {
            return next(new ServiceError(CustomerMasterError.ERR_OTP_NOT_HAVE_IN_REDIS))
        }

        if (storedOtp !== otp) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_OTP_INVALID));
        }

        await redis.set(`reset_otp_verified:${email}`, "true", { EX: 300 })
        await redis.del(redisKey);
        return next()
    } catch (err) {
        next(err)
    }
}



