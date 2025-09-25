import express, { Request, Response, NextFunction } from 'express';
import { createAddressCustomer, deleteAccount, deleteAddressCustomer, editProfileDetail, editProfileImage, fetchAddressBySelected, fetchAddressCustomer, updateAddressCustomer } from '../controller/profileController';
import { authMiddleware, findUserPermission, validateUserPermission } from '../controller/userController';

import { MANAGE_USER } from '../constants/masters/portalPermissionMaster.json'
import { VIEW, CREATE, DELETE, EDIT } from '../constants/masters/portalPermissionActionMaster.json'
import { createUserData, deleteUserData, getUserData, updateUserData } from '../controller/inuserController';
const router = express.Router()

router.get(
    '/',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(MANAGE_USER, VIEW),
    getUserData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                users: res.locals.users,
                total: res.locals.total
            }
        }
        res.json(res.locals.response)
        next()
    }
)
router.patch(
    '/update/:id',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(MANAGE_USER, EDIT),
    updateUserData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: undefined
        }
        res.json(res.locals.response)
        next()
    }
)
router.delete(
    '/delete/:id',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(MANAGE_USER, DELETE),
    deleteUserData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: undefined
        }
        res.json(res.locals.response)
        next()
    }
)

router.post(
    '/create',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(MANAGE_USER, CREATE),
    createUserData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: undefined
        }
        res.json(res.locals.response)
        next()
    }
)
export default router