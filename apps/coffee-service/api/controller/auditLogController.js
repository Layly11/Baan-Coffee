"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findAuditLogs = exports.createFailureAuditLog = exports.createSuccessAuditLog = void 0;
const helpers_1 = require("@coffee/helpers");
const models_1 = require("@coffee/models");
const sequelize_1 = require("sequelize");
const createAuditLog_1 = require("../constants/commons/createAuditLog");
const createSuccessAuditLog = () => {
    return async (req, res, next) => {
        const audit = res.locals.audit;
        if (!audit || Object.keys(audit).length === 0) {
            return next();
        }
        try {
            await models_1.AuditLogModel.create(audit);
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.createSuccessAuditLog = createSuccessAuditLog;
const createFailureAuditLog = () => {
    return async (err, req, res, next) => {
        console.error(err);
        const audit = res.locals.audit;
        if (!audit) {
            return next(err);
        }
        const auditLog = {
            ...audit
        };
        if (err.resDesc?.en)
            auditLog.detail = err.resDesc.en;
        try {
            await models_1.AuditLogModel.create(auditLog);
            next(err);
        }
        catch (err) {
            next(err);
        }
    };
};
exports.createFailureAuditLog = createFailureAuditLog;
const findAuditLogs = () => async (req, res, next) => {
    const { audit_action: auditAction, start_date: startDate, end_date: endDate, menu, text_search: textSearch, limit, offset, } = req.query;
    const portal = req.user;
    const queryString = textSearch?.toString() || '';
    const encryptedFields = ['editor_name', 'staff_id', 'target_name'];
    const encryptedConditions = encryptedFields.map((field) => ({
        [field]: { [sequelize_1.Op.like]: `%${queryString}%` }
    }));
    if (queryString) {
        encryptedConditions.push({ staff_id: { [sequelize_1.Op.like]: `%${queryString}%` } });
    }
    const where = {
        ...(startDate && endDate && {
            created_at: {
                [sequelize_1.Op.between]: [
                    (0, helpers_1.dayjs)(startDate).startOf('day').toISOString(),
                    (0, helpers_1.dayjs)(endDate).endOf('day').toISOString()
                ]
            }
        }),
        ...(menu && { menu }),
        ...(queryString && {
            [sequelize_1.Op.or]: [...encryptedConditions]
        })
    };
    const query = {
        where,
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
        order: [['created_at', 'DESC']]
    };
    try {
        const { count, rows } = await models_1.AuditLogModel.findAndCountAll(query);
        const auditLogs = rows;
        if (auditAction) {
            res.locals.audit = (0, createAuditLog_1.CreateAuditLog)({
                menu: createAuditLog_1.AuditLogMenuType.AUDIT_LOG,
                action: auditAction,
                editorName: portal.username,
                editorRole: portal.role.name,
                eventDateTime: new Date(),
                staffId: portal.id,
                staffEmail: portal.email,
                channel: req.headers['x-original-forwarded-for']?.split(',')[0].split(':')[0] || req.ip,
                searchCriteria: JSON.stringify({ query: req.query }),
                previousValues: undefined,
                newValues: undefined,
                recordKeyValues: undefined,
                isPii: true
            });
        }
        res.locals.total = count;
        res.locals.audit_logs = auditLogs;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.findAuditLogs = findAuditLogs;
//# sourceMappingURL=auditLogController.js.map