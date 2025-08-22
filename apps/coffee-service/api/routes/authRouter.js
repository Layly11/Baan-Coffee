"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const authenController_1 = require("../controller/authenController");
const userController_1 = require("../controller/userController");
const router = express_1.default.Router();
router.post('/register', (0, authenController_1.register)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: 'User registered successfully',
        data: {
            newUser: res.locals.newUser
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/login', (0, authenController_1.login)(), (req, res, next) => {
    const token = res.locals.token;
    res.cookie('authToken', token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 * 1000,
        sameSite: 'lax'
    });
    res.locals.response = {
        res_code: '0000',
        res_desc: 'User login successfully',
        data: {
            accessToken: token.accessToken
        }
    };
    res.json(res.locals.response);
    next();
});
router.post('/refresh-token', (0, authenController_1.refreshToken)(), (req, res, next) => {
    const token = res.locals.token;
    res.cookie('authToken', token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 * 1000,
        sameSite: 'lax'
    });
    res.locals.response = {
        res_code: '0000',
        res_desc: 'RefreshToken successfully',
        data: {
            newAccessToken: token.accessToken
        }
    };
    res.json(res.locals.response);
    next();
});
router.get('/profile', passport_1.default.authenticate('jwt', { session: false }), (0, userController_1.findUserPermission)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: '',
        user: res.locals.user
    };
    res.json(res.locals.response);
    next();
});
router.post('/logout', (0, authenController_1.logout)(), (req, res, next) => {
    res.locals.response = {
        res_code: '0000',
        res_desc: 'Logout Success',
        data: {}
    };
    res.json(res.locals.response);
    next();
});
router.get('/check-availability', (0, authenController_1.checkAvailability)(), (req, res, next) => {
    res.locals.response = {
        checkExist: res.locals.checkExist
    };
    res.json(res.locals.response);
    next();
});
router.get('/test', (req, res, next) => {
    res.json({ user: req.user });
    next();
});
exports.default = router;
//# sourceMappingURL=authRouter.js.map