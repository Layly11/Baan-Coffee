import express, { Request, Response, NextFunction } from 'express';
import { getProductData, getCategory, createProduct, updateProduct, deleteProduct, createCategory, updateCategory, deleteCategory, getBestSeller, getProductByCategory, getCategoryMobile, getProductSize, getSizebyProduct } from '../controller/productController'
import multer from 'multer'
import { authMiddleware, authMiddlewareCustomer, findUserPermission, validateUserPermission } from '../controller/userController';

import { PRODUCT_MENU } from '../constants/masters/portalPermissionMaster.json'
import { VIEW, CREATE, EDIT, DELETE } from '../constants/masters/portalPermissionActionMaster.json'
const router = express.Router()

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 7,
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
    '/sizes',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, VIEW),
    getProductSize(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                size: res.locals.sizes,
            }
        }
        res.json(res.locals.response)
        next()
    }
)


router.post(
    '/create',
    upload.single('product_image'),
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, CREATE),
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
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, EDIT),
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
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, DELETE),
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
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, VIEW),
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
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, CREATE),
    createCategory(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                newCategories: res.locals.newCategories
            }
        }
        res.json(res.locals.response)
        next()
    }
)


router.patch(
    '/category/:id',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, EDIT),
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
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(PRODUCT_MENU, DELETE),
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

////// Mobile ////////

router.get(
    '/bestSeller',
    authMiddlewareCustomer(),
    getBestSeller(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                bestSeller: res.locals.bestSeller
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.get(
    '/category',
    authMiddlewareCustomer(),
    getCategoryMobile(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                category: res.locals.category
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.get(
    '/productData',
    authMiddlewareCustomer(),
    getProductByCategory(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                productData: res.locals.productsData
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.get(
    '/sizes/:id',
    authMiddlewareCustomer(),
    getSizebyProduct(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '1111',
            res_desc: '',
            data: {
                sizes: res.locals.sizes
            }
        }
        res.json(res.locals.response)
        next()
    }
)



export default router