import express, { Request, Response, NextFunction } from 'express';
import { getProductData, createProduct, updateProduct} from '../controller/productController'
import multer from 'multer'
const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024
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
    getProductData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                products: res.locals.products,
                categoryList: res.locals.categoryList
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


export default router