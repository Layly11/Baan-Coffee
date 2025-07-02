import { ServiceError } from "@coffee/helpers";
import { NextFunction, Request, Response } from "express";
import HTTP_ERROR from '../constants/errors/httpError.json'
import { query_type } from "../types/types";
import { MapUserPermissionModel, MenuPermissionModel } from "@coffee/models";


export const findUserPermission = () => async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as any
    if(!user) throw new ServiceError(HTTP_ERROR.ERR_HTTP_401)

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

    try{
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