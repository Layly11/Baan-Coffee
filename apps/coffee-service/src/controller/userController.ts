import { ServiceError } from "@coffee/helpers";
import { NextFunction, Request, Response } from "express";
import HTTP_ERROR from '../constants/errors/httpError.json'
import { query_type } from "../types/types";
import { CustomersModel, MapUserPermissionModel, MenuPermissionModel, UserModel, UserRoleModel } from "@coffee/models";
import { jwtVerify, errors } from 'jose'


export const authMiddleware = () => async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ res_desc: 'Unauthorized' })
    }
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET)

    try {
        const { payload } = await jwtVerify(token, jwtSecret) as any
        const user = await UserModel.findByPk(payload.id, {
            attributes: ['id', 'username', 'email', 'role_id', 'last_login'],
            include: [
                {
                    model: UserRoleModel,
                    as: 'role',
                    attributes: ['name']
                }
            ]
        })
        req.user = user as any
        next()
    } catch (err) {
        return next(new ServiceError(HTTP_ERROR.ERR_HTTP_401))
    }
}


export const authMiddlewareCustomer = () => async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.split(' ')[1]
    if (!token) {
        return res.status(401).json({ res_desc: 'Unauthorized' })
    }
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET_CUSTOMER)
    
    try {
        const { payload } = await jwtVerify(token, jwtSecret) as any
        const exists = await CustomersModel.findByPk(payload.id)

        if (!exists) {
            return next(new ServiceError(HTTP_ERROR.ERR_HTTP_401))
        }

        req.user = exists

        next()
    } catch (err:any) {
        if (err instanceof errors.JWTExpired) {
            return res.status(401).json({
                res_desc: 'Token expired',
                res_code: '0401'
            })
        }
        return next(err)
    }
}

export const findUserPermission = () => async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any

    if (!user) return next(new ServiceError(HTTP_ERROR.ERR_HTTP_401))

    const query: query_type = {
        include: [
            {
                model: MenuPermissionModel,
                as: 'menu',
                required: true
            }
        ],
        where: {
            role_id: user.role_id
        }
    }

    try {
        const permissionMapping = await MapUserPermissionModel.findAll(
            query
        )

        res.locals.permissions = permissionMapping.map((permission: any) => {
            const permissionArray: any = {
                name: permission.menu.name,
                view: permission.view,
                create: permission.create,
                edit: permission.edit,
                delete: permission.delete
            }

            return permissionArray
        })

        const formatUser = {
            id: user.id,
            role: user.role.name,
            username: user.username,
            email: user.email,
            last_login: user.last_login,
            permissions: res.locals.permissions
        }

        res.locals.user = formatUser

        next()

    } catch (error) {
        next(error)
    }

}

export const validateUserPermission = (name: string, action: string) => {

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const permission = res.locals.permissions.find(
                (permission: any) => permission.name === name
            )

            if (!permission?.[action.toLowerCase()]) {
                return next(new ServiceError(HTTP_ERROR.ERR_HTTP_403))
            }
            next()
        } catch (err) {
            next(err)
        }
    }
}