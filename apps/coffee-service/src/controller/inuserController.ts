import { dayjs, ServiceError } from "@coffee/helpers";
import { UserModel, UserRoleModel } from "@coffee/models";
import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import * as jose from 'jose'
import UserErrorMaster from "../constants/errors/user.error.json";
import { getRedisClient } from "../helpers/redis";
import { sendResetPasswordAdmin } from "../utils/emailUtils";
import { AuditLogActionType, AuditLogMenuType, CreateAuditLog } from "../constants/commons/createAuditLog";

export const getUserData = () => async (req: Request, res: Response, next: NextFunction) => {

    const { audit_action: auditAction, information, role, limit, offset } = req.query;
    try {
        const infoStr = typeof information === 'string' ? information : undefined;
        const roles = Array.isArray(role) ? role : role ? [role] : [];
        const roleIds = roles.map(r => Number(r)).filter(r => !isNaN(r));
        const portal = req.user as any

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

        if (auditAction) {
            res.locals.audit = CreateAuditLog(
                {
                    menu: AuditLogMenuType.USERS,
                    action: auditAction,
                    editorName: portal.username,
                    editorRole: portal.role.name,
                    eventDateTime: new Date(),
                    staffId: portal.id,
                    staffEmail: portal.email,
                    channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                    searchCriteria: JSON.stringify({ query: req.query }),
                    previousValues: undefined,
                    newValues: undefined,
                    recordKeyValues: undefined,
                    isPii: true
                }
            )
        }

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
    const currentUser = req.user as any
    try {
        const user = await UserModel.findByPk(id)
        if (!user) {
            return next(new ServiceError(UserErrorMaster.USER_NOT_FOUND))
        }
        const previousValues = {
            username: user.username,
            email: user.email,
            role: user.role_id,
            status: user.status
        }

        if (currentUser.role_id === 2) {
            if (role === 1 || role === 2) {
                return next(new ServiceError(UserErrorMaster.ERR_ADMIN_PERMISSION))
            }
        }

        if (username !== '' && username !== null && username !== undefined) {
            user.username = username
        }

        if (email !== '' && email !== null && email !== undefined) {
            const userExist = await UserModel.findOne({ where: { email } })
            if (userExist && userExist.id !== user.id) {
                return next(new ServiceError(UserErrorMaster.EMAIL_IS_EXISTS))
            }
            user.email = email
        }

        if (role !== '' && role !== null && role !== undefined) {
            user.role_id = role
        }

        if (status !== '' && status !== null && status !== undefined) {
            user.status = status
        }

        await user.save()

        res.locals.audit = CreateAuditLog(
            {
                menu: AuditLogMenuType.USERS,
                action: AuditLogActionType.EDIT_USER,
                editorName: currentUser.username,
                editorRole: currentUser.role.name,
                targetName: previousValues.username,
                eventDateTime: new Date(),
                staffId: currentUser.id,
                staffEmail: currentUser.email,
                channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                searchCriteria: undefined,
                previousValues: JSON.stringify(previousValues),
                newValues: JSON.stringify(req.body),
                recordKeyValues: undefined,
                isPii: true
            }
        )

        return next()

    } catch (err) {
        next(err)
    }
}

export const deleteUserData = () => async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const currentUser = req.user as any

    try {
        const user = await UserModel.findByPk(id)

        if (!user) {
            return next(new ServiceError(UserErrorMaster.USER_NOT_FOUND))
        }
        const targetName = user.username
        if (currentUser.id === user.id) {
            return next(new ServiceError(UserErrorMaster.CAN_NOT_DELETE_OWN_ACCOUNT))
        }


        if (currentUser.role_id === 1) {
            await user.destroy()
            res.locals.audit = CreateAuditLog(
                {
                    menu: AuditLogMenuType.USERS,
                    action: AuditLogActionType.DELETE_USER,
                    editorName: currentUser.username,
                    editorRole: currentUser.role.name,
                    targetName,
                    eventDateTime: new Date(),
                    staffId: currentUser.id,
                    staffEmail: currentUser.email,
                    channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                    searchCriteria: undefined,
                    previousValues: undefined,
                    newValues: undefined,
                    recordKeyValues: undefined,
                    isPii: true
                }
            )
            return next()
        }


        if (currentUser.role_id === 2) {
            if (user.role_id === 1 || user.role_id === 2) {
                return next(new ServiceError(UserErrorMaster.CAN_NOT_DELETE_SUPER_ADMIN))
            }
            await user.destroy()
            res.locals.audit = CreateAuditLog(
                {
                    menu: AuditLogMenuType.USERS,
                    action: AuditLogActionType.DELETE_USER,
                    editorName: currentUser.username,
                    editorRole: currentUser.role.name,
                    targetName,
                    eventDateTime: new Date(),
                    staffId: currentUser.id,
                    staffEmail: currentUser.email,
                    channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                    searchCriteria: undefined,
                    previousValues: undefined,
                    newValues: undefined,
                    recordKeyValues: undefined,
                    isPii: true
                }
            )
            return next()
        }


        return next(new ServiceError(UserErrorMaster.NOT_HAVE_PERMISSION_DELETE))

    } catch (err) {
        next(err)
    }
}


export const createUserData = () => async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password, role, status } = req.body
    const currentUser = req.user as any
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

        if (currentUser.role_id === 2) {
            if (role === 1 || role === 2) {
                return next(new ServiceError(UserErrorMaster.ERR_ADMIN_PERMISSION))
            }
        }

        const emailExists = await UserModel.findOne({ where: { email } })

        if (emailExists) {
            return next(new ServiceError(UserErrorMaster.EMAIL_IS_EXISTS))
        }

        await UserModel.create({
            username,
            email,
            password,
            role_id: role,
            status
        })


        res.locals.audit = CreateAuditLog(
            {
                menu: AuditLogMenuType.USERS,
                action: AuditLogActionType.CREATE_USER,
                editorName: currentUser.username,
                editorRole: currentUser.role.name,
                targetName: username,
                eventDateTime: new Date(),
                staffId: currentUser.id,
                staffEmail: currentUser.email,
                channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                searchCriteria: undefined,
                previousValues: undefined,
                newValues: undefined,
                recordKeyValues: JSON.stringify({
                    username,
                    email,
                    password,
                    role_id: role,
                    status
                }),
                isPii: true
            }
        )

        return next()
    } catch (err) {
        next(err)
    }
}

export const resetPasswordUser = () => async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const redis = getRedisClient()
    const portal = req.user as any
    try {
        const user = await UserModel.findOne({
            where: {
                id,
                status: true
            }
        })

        if (!user) {
            return next(new ServiceError(UserErrorMaster.USER_NOT_FOUND))
        }
        const targetName = user.username

        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET)

        const token = await new jose.SignJWT({ userId: user.id })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("15m")
            .sign(jwtSecret);

        await redis.set(`reset_token:${token}`, user.id, { EX: 15 * 60 });

        const resetLink = `http://localhost:9301/reset-password?token=${token}`


        await sendResetPasswordAdmin(user.email, resetLink)

        res.locals.audit = CreateAuditLog(
            {
                menu: AuditLogMenuType.USERS,
                action: AuditLogActionType.RESET_PASSWORD_USER,
                editorName: portal.username,
                editorRole: portal.role.name,
                targetName,
                eventDateTime: new Date(),
                staffId: portal.id,
                staffEmail: portal.email,
                channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                searchCriteria: JSON.stringify({ query: req.query }),
                previousValues: undefined,
                newValues: undefined,
                recordKeyValues: undefined,
                isPii: true
            }
        )
        return next()
    } catch (err) {
        next(err)
    }
}