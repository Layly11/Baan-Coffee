import express, { Request, Response, NextFunction } from 'express';
import { getDashBoardData } from '../controller/dashboardController'

const router = express.Router()

router.get(
    '/summary-list',
    getDashBoardData(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                total: res.locals.total,
                summaryList: res.locals.summaryList
            }
        }
        res.json(res.locals.response)
        next()
    }
)

export default router