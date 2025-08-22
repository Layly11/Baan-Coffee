"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productController_1 = require("../controller/productController");
const multer_1 = __importDefault(require("multer"));
const userController_1 = require("../controller/userController");
const portalPermissionMaster_json_1 = require("../constants/masters/portalPermissionMaster.json");
const portalPermissionActionMaster_json_1 = require("../constants/masters/portalPermissionActionMaster.json");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
        fields: 6,
        fieldNameSize: 100
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(null, false);
        }
    }
});
router.get('/', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.PRODUCT_MENU, portalPermissionActionMaster_json_1.VIEW), (0, productController_1.getProductData)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            products: res.locals.products,
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/create', upload.single('product_image'), (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.PRODUCT_MENU, portalPermissionActionMaster_json_1.CREATE), (0, productController_1.createProduct)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            newProduct: res.locals.newProduct
        }
    };
    res.json(res.locals.response);
    next();
});
router.patch('/item/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.PRODUCT_MENU, portalPermissionActionMaster_json_1.EDIT), upload.single('product_image'), (0, productController_1.updateProduct)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            item: res.locals.item
        }
    };
    res.json(res.locals.response);
    next();
});
router.delete('/item/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.PRODUCT_MENU, portalPermissionActionMaster_json_1.DELETE), (0, productController_1.deleteProduct)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.get('/categories', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.PRODUCT_MENU, portalPermissionActionMaster_json_1.VIEW), (0, productController_1.getCategory)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            category: res.locals.category
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/categories/create', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.PRODUCT_MENU, portalPermissionActionMaster_json_1.CREATE), (0, productController_1.createCategory)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            newCategories: res.locals.newCategories
        }
    };
    res.json(res.locals.response);
    next();
});
router.patch('/category/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.PRODUCT_MENU, portalPermissionActionMaster_json_1.EDIT), (0, productController_1.updateCategory)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: {
            item: res.locals.item
        }
    };
    res.json(res.locals.response);
    next();
});
router.delete('/category/:id', (0, userController_1.authMiddleware)(), (0, userController_1.findUserPermission)(), (0, userController_1.validateUserPermission)(portalPermissionMaster_json_1.PRODUCT_MENU, portalPermissionActionMaster_json_1.DELETE), (0, productController_1.deleteCategory)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        data: undefined
    };
    res.json(res.locals.response);
    next();
});
router.get('/bestSeller', (0, userController_1.authMiddlewareCustomer)(), (0, productController_1.getBestSeller)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            bestSeller: res.locals.bestSeller
        }
    };
    res.json(res.locals.response);
    next();
});
router.get('/category', (0, userController_1.authMiddlewareCustomer)(), (0, productController_1.getCategoryMobile)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            category: res.locals.category
        }
    };
    res.json(res.locals.response);
    next();
});
router.get('/productData', (0, userController_1.authMiddlewareCustomer)(), (0, productController_1.getProductByCategory)(), (req, res, next) => {
    res.locals.response = {
        res_code: '1111',
        res_desc: '',
        data: {
            productData: res.locals.productsData
        }
    };
    res.json(res.locals.response);
    next();
});
exports.default = router;
//# sourceMappingURL=productRouter.js.map