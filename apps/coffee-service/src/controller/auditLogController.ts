import { dayjs } from '@coffee/helpers';
import { AuditLogModel } from '@coffee/models';
import express, { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { AuditLogActionType, AuditLogMenuType, CreateAuditLog } from '../constants/commons/createAuditLog';


export const createSuccessAuditLog = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const audit = res.locals.audit

        if (!audit || Object.keys(audit).length === 0) {
            return next()
        }

        try {
            await AuditLogModel.create(audit)
            next()
        } catch (err) {
            next(err)
        }
    }
}

export const createFailureAuditLog = () => {
    return async (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error(err)
        const audit = res.locals.audit

        if (!audit) {
            return next(err)
        }

        const auditLog = {
            ...audit
        }
        if (err.resDesc?.en) auditLog.detail = err.resDesc.en

        try {
            await AuditLogModel.create(auditLog)
            next(err)
        } catch (err) {
            next(err)
        }
    }
}


export const findAuditLogs = () => async (req: Request, res: Response, next: NextFunction) => {
    const {
        audit_action: auditAction,
        start_date: startDate,
        end_date: endDate,
        limit,
        offset,

    } = req.query

    const portal = req.user as any
    const where = {
        ...(startDate && endDate && {
            created_at: {
                [Op.between]: [
                    dayjs(startDate as string).startOf('day').toISOString(),
                    dayjs(endDate as string).endOf('day').toISOString()
                ]
            }
        })
    }


    const query = {
        where,
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
        order: [['created_at', 'DESC']]
    } as any

    try {
        const { count, rows } = await AuditLogModel.findAndCountAll(query)
        const auditLogs = rows

        if (auditAction) {
            res.locals.audit = CreateAuditLog(
                {
                    menu: AuditLogMenuType.AUDIT_LOG,
                    action: auditAction,
                    editorName: portal.username,
                    editorRole: portal.role.name,
                    eventDateTime: new Date(),
                    staffId: portal.id,
                    staffEmail: portal.email,
                    channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                    searchCriteria: JSON.stringify({ query: req.query }),
                    previousValues: undefined,
                    newValues: undefined,
                    recordKeyValues: undefined,
                    isPii: true
                }
            )
        }


        res.locals.total = count
        res.locals.audit_logs = auditLogs
        return next()
    } catch (err) {
        next(err)
    }

}

