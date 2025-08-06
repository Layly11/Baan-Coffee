import { ServiceError } from '@coffee/helpers';
import { CustomersModel } from '@coffee/models'
import { NextFunction, Request, Response } from "express"
import CustomerMasterError from '../constants/errors/customer.error.json'
import * as jose from 'jose'
import { sendOtpEmail } from '../utils/emailUtils';

export const registerCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
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

        const otp = String(Math.floor(100000 + Math.random() * 900000).toString());
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

        await CustomersModel.create(
            {
                name,
                email,
                password,
                phone,
                verified: false,
                email_otp: otp,
                email_otp_expire: otpExpire
            }
        )

        await sendOtpEmail(email, otp);

        return next()
    } catch (err) {
        next(err)
    }
}

export const verifyOtpCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
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

        if (!customer.email_otp || customer.email_otp !== otp || !customer.email_otp_expire || new Date() > new Date(customer.email_otp_expire)) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_OTP_INVALID));
        }


        customer.verified = true;
        customer.email_otp = null;
        customer.email_otp_expire = null;
        await customer.save()

        return next()
    } catch (err) {
        next(err)
    }
}


export const resendOtpCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        if (!email) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_REQUIRED));
        }

        const customer = await CustomersModel.findOne({ where: { email } });
        if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const otpExpire = new Date(Date.now() + 5 * 60 * 1000);

        customer.email_otp = otp;
        customer.email_otp_expire = otpExpire;
        await customer.save();

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