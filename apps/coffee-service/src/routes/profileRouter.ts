import express, { Request, Response, NextFunction } from 'express';
import { createAddressCustomer, deleteAccount, deleteAddressCustomer, editProfileDetail, editProfileImage, fetchAddressCustomer, updateAddressCustomer } from '../controller/profileController';


import multer from 'multer';
import { authMiddlewareCustomer } from '../controller/userController';
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router()

router.post(
    '/upload-image',
    upload.single('profile_img'),
    editProfileImage(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                imageUrl: res.locals.imageUrl
            }
        }
        res.json(res.locals.response)
        next()
    }
)


router.patch(
    '/edit',
    editProfileDetail(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                customer: res.locals.customer
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.delete(
    '/delete',
    authMiddlewareCustomer(),
    deleteAccount(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: undefined
        }
        res.json(res.locals.response)
        next()
    }
)

router.get(
    '/address',
    authMiddlewareCustomer(),
    fetchAddressCustomer(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                address: res.locals.address
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.post(
    '/create/address',
    authMiddlewareCustomer(),
    createAddressCustomer(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                address: res.locals.address
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.delete(
    '/delete/address/:id',
    authMiddlewareCustomer(),
    deleteAddressCustomer(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: undefined
        }
        res.json(res.locals.response)
        next()
    }
)


router.put(
    '/edit/address/:id',
    authMiddlewareCustomer(),
    updateAddressCustomer(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                address: res.locals.address
            }
        }
        res.json(res.locals.response)
        next()
    }
)
export default router