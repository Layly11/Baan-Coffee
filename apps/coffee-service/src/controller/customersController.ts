import { ServiceError } from '@coffee/helpers';
import { CustomersModel } from '@coffee/models'
import { NextFunction, Request, Response } from "express"
import CustomerMasterError from '../constants/errors/customer.error.json'
import * as jose from 'jose'

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


        await CustomersModel.create(
            {
                name,
                email,
                password,
                phone,
                verified: false
            }
        )

        return next()
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