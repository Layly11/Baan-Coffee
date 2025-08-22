"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboardController_1 = require("../controller/dashboardController");
const userController_1 = require("../controller/userController");
const portalPermissionMaster_json_1 = require("../constants/masters/portalPermissionMaster.json");
const portalPermissionActionMaster_json_1 = require("../constants/masters/portalPermissionActionMaster.json");
const router = express_1.default.Router();
router.get('/summary-list', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.DASHBOARD, portalPermissionActionMaster_json_1.VIEW), (0, dashboardController_1.getDashBoardData)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            total: res.locals.total,
            summaryList: res.locals.summaryList
        }
    };
    res.json(res.locals.response);
    next();
});
router.get('/overview', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.DASHBOARD, portalPermissionActionMaster_json_1.VIEW), (0, dashboardController_1.getDashBoardOverview)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            overview: res.locals.overview
        }
    };
    res.json(res.locals.response);
    next();
});
router.get('/detail/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.DASHBOARD, portalPermissionActionMaster_json_1.VIEW), (0, dashboardController_1.getDashboardDetail)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            detail: res.locals.detail
        }
    };
    res.json(res.locals.response);
    next();
});
exports.default = router;
//# sourceMappingURL=dashboardRouter.js.map