import { dayjs, ServiceError } from '@coffee/helpers';
import { CustomersModel, OrderModel } from '@coffee/models'
import e, { NextFunction, Request, Response } from "express"
import CustomerMasterError from '../constants/errors/customer.error.json'
import * as jose from 'jose'
import { sendOtpEmail, sendResetPasswordEmail } from '../utils/emailUtils';
import { getRedisClient } from '../helpers/redis';
import { Op, or, } from "sequelize";

export const getCustomerData = () => async (req: Request, res: Response, next: NextFunction) => {
    const { information, limit, offset } = req.query;

    try {
        const infoStr = typeof information === 'string' ? information : undefined;

        const where = infoStr
            ? {
                isDeleted: false,
                [Op.or]: [
                    { name: { [Op.like]: `%${infoStr}%` } },
                    { email: { [Op.like]: `%${infoStr}%` } },
                    { phone: { [Op.like]: `%${infoStr}%` } },
                ],
            }
            : { isDeleted: false};

        const { count, rows } = await CustomersModel.findAndCountAll({
            where,
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
            order: [['createdAt', 'ASC']],
        })

        res.locals.total = count
        res.locals.customers = rows

        return next()

    } catch (err) {
        next(err)
    }
}
export const getCustomerOrderData =
  () => async (req: Request, res: Response, next: NextFunction) => {
    const { limit, offset } = req.query;
    const customerId = req.params.id;

    try {
      const { count, rows } = await OrderModel.findAndCountAll({
        where: { customer_id: customerId },
        include: [
          {
            model: CustomersModel,
            as: "customer",
            attributes: ["id", "phone"], // เลือกเฉพาะที่ใช้
          },
        ],
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
        order: [["time", "DESC"]],
      });

      const orders = rows.map((o: any) => {
        const order = o.get({ plain: true });

        let shippingAddress = order.shipping_address;
        if (typeof shippingAddress === "object" && shippingAddress !== null) {
          shippingAddress = [
            shippingAddress.street,
            shippingAddress.city,
            shippingAddress.zipcode,
          ]
            .filter(Boolean)
            .join(", ");
        }

        return {
          ...order,
          timeRaw: order.time,
          time: dayjs(order.time).format("DD/MM/YYYY HH:mm"),
          shipping_address: shippingAddress,
          phone: order.customer?.phone,
        };
      });

      res.locals.total = count; 
      res.locals.orders = orders;

      return next();
    } catch (err) {
      next(err);
    }
  };


export const updateCustomerData = () => async (req: Request, res: Response, next: NextFunction) => {
    
    const id = req.params.id
    const {name, email, phone, verified} = req.body

    try {
        
        const customer = await CustomersModel.findByPk(id)
        if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND))
        }
        if(name !== '' && name !== null && name !== undefined ) {
            customer.name= name
        }
        if(email !== '' && email !== null && email !== undefined ) {
            customer.email= email
        }
        if(phone !== '' && phone !== null && phone !== undefined ) {
            customer.phone= phone
        }

        customer.verified = verified
        await customer.save()
        return next()

    } catch (err) {
        next(err)
    }
}




export const deleteCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    try {
        const customer = await CustomersModel.findOne({
            where: {
                id: id,
                isDeleted: false
            }
        })

         if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND))
        }

        await customer.update({ isDeleted: true });

       
        return next()

    } catch (err) {
        next(err)
    }
}









//////////////////////////////////////////////////Mobile/////////////////////////////////////////////////











export const registerCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient()
    try {
        const { name, email, password, phone } = req.body

        const existsEmail = await CustomersModel.findOne({ where: { email, isDeleted: false } });
        if (existsEmail) {
            return next(new ServiceError(CustomerMasterError.ERR_REGISTER_EMAIL_EXIST))

        }

        const existsPhone = await CustomersModel.findOne({ where: { phone , isDeleted: false} });
        if (existsPhone) {
            return next(new ServiceError(CustomerMasterError.ERR_REGISTER_PHONE_EXIST))

        }

        if (!password) {
            return next(new ServiceError(CustomerMasterError.ERR_PASSWORD_REQUIRED));
        }

        await CustomersModel.create(
            {
                name,
                email,
                password,
                phone,
                image_url: null,
                verified: false,
                isDeleted: false,
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

        const emailExists = await CustomersModel.findOne({ where: { email, isDeleted: false } })
        const phoneExists = await CustomersModel.findOne({ where: { phone, isDeleted: false } });

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

        const customer = await CustomersModel.findOne({ where: { email, isDeleted: false } });

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

        const customer = await CustomersModel.findOne({ where: { email, isDeleted: false } });
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

        const customer = await CustomersModel.findOne({ where: { email, isDeleted: false } })
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
            token
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

        const customer = await CustomersModel.findOne({ where: { email, isDeleted: false } })

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

        const customer = await CustomersModel.findOne({ where: { email, isDeleted: false } })

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


export const requireResetVerified = () => async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient();
    try {
        let { email } = req.body as any

        if (!email) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_REQUIRED));
        }

        const allowed = await redis.get(`reset_otp_verified:${email}`);

        if (!allowed) {
            return next(new ServiceError(CustomerMasterError.ERR_OTP_NOT_VERIFIED_OR_EXPIRED));
        }

        res.locals.resetVerifiedEmail = email;

        return next();
    } catch (err) {
        next(err)
    }
}



export const resetPassword = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const email = (res.locals.resetVerifiedEmail as string) || (req.body.email as string);
        const { newPassword } = req.body as any

        if (!newPassword) {
            return next(new ServiceError(CustomerMasterError.ERR_PASSWORD_REQUIRED));
        }

        const policy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\W_]{8,}$/;
        if (!policy.test(newPassword)) {
            return next(new ServiceError(CustomerMasterError.ERR_PASSWORD_POLICY_INVALID));
        }

        const customer = await CustomersModel.findOne({ where: { email, isDeleted: false } })
        if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }

        customer.password = newPassword
        await customer.save()

        const redis = getRedisClient();
        await redis.del(`reset_otp_verified:${email}`);

        return next()
    } catch (err) {
        next(err)
    }
}

export const getProfileData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user as any
        const customer = await CustomersModel.findOne({
            where: {
                id: user.id,
                isDeleted: false
            }
        })

        if (!customer) {
            return next(new ServiceError(CustomerMasterError.ERR_CUSTOMER_EMAIL_NOT_FOUND));
        }

        res.locals.customer = {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            profile_img: customer.image_url
        }

        return next()
    } catch (err) {
        next(err)
    }
}