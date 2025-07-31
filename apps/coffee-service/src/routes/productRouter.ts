import express, { Request, Response, NextFunction } from 'express';
import { getProductData, getCategory, createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory, getBestSeller } from '../controller/productController'
import multer from 'multer'
import { authMiddleware, findUserPermission, validateUserPermission } from '../controller/userController';

import { PRODUCT_MENU } from '../constants/masters/portalPermissionMaster.json'
import { VIEW } from '../constants/masters/portalPermissionActionMaster.json'
const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,                 
        fields: 5,               
        fieldNameSize: 100
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
})

router.get(
    '/',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, VIEW),
    getProductData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                products: res.locals.products,
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.get(
    '/bestSeller',
    getBestSeller(),
     (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                bestSeller: res.locals.bestSeller
            }
        }
        res.json(res.locals.response)
        next()
     }
)

router.post(
    '/create',
    upload.single('product_image'),
    createProduct(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                newProduct: res.locals.newProduct
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.patch(
    '/item/:id',
    upload.single('product_image'),
    updateProduct(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                item: res.locals.item
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.delete(
  '/item/:id',
  deleteProduct(),
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

router.get(
    '/categories',
    getCategory(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                category: res.locals.category
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.post(
    '/categories/create',
    createCategory(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                newCategories:  res.locals.newCategories
            }
        }
        res.json(res.locals.response)
        next()
    }
)


router.patch(
    '/category/:id',
    updateCategory(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                item: res.locals.item
            }
        }
        res.json(res.locals.response)
        next()
    }
)


router.delete(
  '/category/:id',
  deleteCategory(),
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