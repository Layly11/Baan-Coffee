import { dayjs, ServiceError } from "@coffee/helpers";
import { UserModel, UserRoleModel } from "@coffee/models";
import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import * as jose from 'jose'
import UserErrorMaster from "../constants/errors/user.error.json";
import { getRedisClient } from "../helpers/redis";
import { sendResetPasswordAdmin } from "../utils/emailUtils";

export const getUserData = () => async (req: Request, res: Response, next: NextFunction) => {

    const { information, role, limit, offset } = req.query;
    try {
        const infoStr = typeof information === 'string' ? information : undefined;
        const roles = Array.isArray(role) ? role : role ? [role] : [];
        const roleIds = roles.map(r => Number(r)).filter(r => !isNaN(r));

        const where = infoStr
            ? {
                ...(roleIds.length > 0 && { role_id: { [Op.in]: roleIds } }),
                [Op.or]: [
                    { username: { [Op.like]: `%${infoStr}%` } },
                    { email: { [Op.like]: `%${infoStr}%` } },
                ],
            }
            : { ...(roleIds.length > 0 && { role_id: { [Op.in]: roleIds } }), };

        const { count, rows } = await UserModel.findAndCountAll({
            where,
            include: [
                {
                    model: UserRoleModel,
                    as: 'role'
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
        })


        const users = rows.map((u: any) => {
            const user = u.get({ plain: true }) // แปลง Sequelize instance -> plain object
            return {
                ...user,
                time: dayjs(user.createdAt).format('DD/MM/YYYY HH:mm'),
                last_login: user.last_login
                    ? dayjs(user.last_login).format('DD/MM/YYYY HH:mm')
                    : '-',
                recent_login: user.recent_login ? dayjs(user.recent_login).format('DD/MM/YYYY HH:mm')
                    : 'Never logged in',
                role: user.role.name

            }
        })

        res.locals.total = count
        res.locals.users = users
        return next()
    } catch (err) {
        next(err)
    }
}


export const updateUserData = () => async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const { username, email, role, status } = req.body
    try {
        const user = await UserModel.findByPk(id)

        if (!user) {
            return next(new ServiceError(UserErrorMaster.USER_NOT_FOUND))
        }

        if (username !== '' && username !== null && username !== undefined) {
            user.username = username
        }

        if (email !== '' && email !== null && email !== undefined) {
            user.email = email
        }

        if (role !== '' && role !== null && role !== undefined) {
            user.role_id = role
        }

        if (status !== '' && status !== null && status !== undefined) {
            user.status = status
        }

        await user.save()

        return next()

    } catch (err) {
        next(err)
    }
}

export const deleteUserData = () => async (req: Request, res: Response, next: NextFunction) => {

    const id = req.params.id
    try {
        const user = await UserModel.findByPk(id)
        if (!user) {
            return next(new ServiceError(UserErrorMaster.USER_NOT_FOUND))
        }

        await user.destroy()

        return next()
    } catch (err) {
        next(err)
    }
}

export const createUserData = () => async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, role, status } = req.body
    try {

        if (!username) {
            return next(new ServiceError(UserErrorMaster.USERNAME_NOT_FOUND))
        }

        if (!email) {
            return next(new ServiceError(UserErrorMaster.EMAIL_NOT_FOUND))
        }

        if (!password) {
            return next(new ServiceError(UserErrorMaster.PASSSWORD_NOT_FOUND))
        }

        if (!role) {
            return next(new ServiceError(UserErrorMaster.ROLE_NOT_FOUND))
        }


        await UserModel.create({
            username,
            email,
            password,
            role_id: role,
            status
        })

        return next()
    } catch (err) {
        next(err)
    }
}

export const resetPasswordUser = () => async (req: Request, res: Response, next: NextFunction) => {
    const {id} = req.params
    const redis = getRedisClient()
    try {
        const user = await UserModel.findOne({
            where: {
                id,
                status: true
            }
        })

        if(!user) {
             return next(new ServiceError(UserErrorMaster.USER_NOT_FOUND))
        }

        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET)

        const token = await new jose.SignJWT({ userId: user.id })
              .setProtectedHeader({ alg: "HS256" })
              .setExpirationTime("15m")
              .sign(jwtSecret);

        await redis.set(`reset_token:${token}`, user.id, { EX: 15 * 60 });

        const resetLink = `http://localhost:9301/reset-password?token=${token}`

        await sendResetPasswordAdmin(user.email, resetLink)

        return next()
    } catch (err) {
        next(err)
    }
}