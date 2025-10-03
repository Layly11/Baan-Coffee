import express, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { findAuditLogs } from '../controller/auditLogController'
import { authMiddleware, findUserPermission, validateUserPermission } from '../controller/userController'
import { AUDIT_LOG } from '../constants/masters/portalPermissionMaster.json'
import { VIEW, CREATE, EDIT, DELETE } from '../constants/masters/portalPermissionActionMaster.json'

const router = express.Router()

router.get(
    '/',
    authMiddleware(),
    findUserPermission(),
    validateUserPermission(AUDIT_LOG, VIEW),
    findAuditLogs(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            data: {
                total: res.locals.total,
                audit_logs: res.locals.audit_logs
            }
        }
        res.json(res.locals.response)
        next()
    }
)






export default router;