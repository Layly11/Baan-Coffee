import express, { Request, Response, NextFunction } from 'express';
import { getDashBoardData, getDashboardDetail, getDashBoardOverview } from '../controller/dashboardController'
import { authMiddleware, findUserPermission, validateUserPermission } from '../controller/userController';

import { DASHBOARD } from '../constants/masters/portalPermissionMaster.json'
import { VIEW } from '../constants/masters/portalPermissionActionMaster.json'


const router = express.Router()

router.get(
    '/summary-list',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(DASHBOARD, VIEW),
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

router.get(
    '/overview',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(DASHBOARD, VIEW),
    getDashBoardOverview(),
     (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                overview: res.locals.overview
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.get(
    '/detail/:id',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(DASHBOARD, VIEW),
    getDashboardDetail(),
     (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                detail: res.locals.detail
            }
        }
        res.json(res.locals.response)
        next()
    }
)
export default router