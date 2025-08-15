import express, { Request, Response, NextFunction } from 'express';
import { editProfileDetail, editProfileImage } from '../controller/profileController';


import multer from 'multer';
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
export default router