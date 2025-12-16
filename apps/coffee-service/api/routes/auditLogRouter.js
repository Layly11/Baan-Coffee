"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auditLogController_1 = require("../controller/auditLogController");
const userController_1 = require("../controller/userController");
const portalPermissionMaster_json_1 = require("../constants/masters/portalPermissionMaster.json");
const portalPermissionActionMaster_json_1 = require("../constants/masters/portalPermissionActionMaster.json");
const router = express_1.default.Router();
router.get('/', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.AUDIT_LOG, portalPermissionActionMaster_json_1.VIEW), (0, auditLogController_1.findAuditLogs)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            total: res.locals.total,
            audit_logs: res.locals.audit_logs
        }
    };
    res.json(res.locals.response);
    next();
});
exports.default = router;
//# sourceMappingURL=auditLogRouter.js.map