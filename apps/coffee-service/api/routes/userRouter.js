"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const portalPermissionMaster_json_1 = require("../constants/masters/portalPermissionMaster.json");
const portalPermissionActionMaster_json_1 = require("../constants/masters/portalPermissionActionMaster.json");
const inuserController_1 = require("../controller/inuserController");
const router = express_1.default.Router();
router.get('/', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_USER, portalPermissionActionMaster_json_1.VIEW), (0, inuserController_1.getUserData)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            users: res.locals.users,
            total: res.locals.total
        }
    };
    res.json(res.locals.response);
    next();
});
router.patch('/update/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_USER, portalPermissionActionMaster_json_1.EDIT), (0, inuserController_1.updateUserData)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.delete('/delete/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_USER, portalPermissionActionMaster_json_1.DELETE), (0, inuserController_1.deleteUserData)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.post('/create', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_USER, portalPermissionActionMaster_json_1.CREATE), (0, inuserController_1.createUserData)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.post('/reset-password/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.MANAGE_USER, portalPermissionActionMaster_json_1.CREATE), (0, inuserController_1.resetPasswordUser)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
exports.default = router;
//# sourceMappingURL=userRouter.js.map