"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const profileController_1 = require("../controller/profileController");
const multer_1 = __importDefault(require("multer"));
const userController_1 = require("../controller/userController");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = express_1.default.Router();
router.post('/upload-image', upload.single('profile_img'), (0, profileController_1.editProfileImage)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            imageUrl: res.locals.imageUrl
        }
    };
    res.json(res.locals.response);
    next();
});
router.patch('/edit', (0, profileController_1.editProfileDetail)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            customer: res.locals.customer
        }
    };
    res.json(res.locals.response);
    next();
});
router.delete('/delete', (0, userController_1.authMiddlewareCustomer)(), (0, profileController_1.deleteAccount)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.get('/address', (0, userController_1.authMiddlewareCustomer)(), (0, profileController_1.fetchAddressCustomer)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            address: res.locals.address
        }
    };
    res.json(res.locals.response);
    next();
});
router.get('/address/:id', (0, userController_1.authMiddlewareCustomer)(), (0, profileController_1.fetchAddressBySelected)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            address: res.locals.address
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/create/address', (0, userController_1.authMiddlewareCustomer)(), (0, profileController_1.createAddressCustomer)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            address: res.locals.address
        }
    };
    res.json(res.locals.response);
    next();
});
router.delete('/delete/address/:id', (0, userController_1.authMiddlewareCustomer)(), (0, profileController_1.deleteAddressCustomer)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.put('/edit/address/:id', (0, userController_1.authMiddlewareCustomer)(), (0, profileController_1.updateAddressCustomer)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            address: res.locals.address
        }
    };
    res.json(res.locals.response);
    next();
});
exports.default = router;
//# sourceMappingURL=profileRouter.js.map