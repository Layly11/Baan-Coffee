import express, { Request, Response, NextFunction } from 'express';
import passport, { session } from 'passport';
import { register, login, refreshToken, logout } from '../controller/authenController'
import { findUserPermission } from '../controller/userController'

const router = express.Router()

router.post(
    '/register',
    register(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: 'User registered successfully',
            data: {
                newUser: res.locals.newUser
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.post(
    '/login',
    login(),
     (req: Request, res: Response, next: NextFunction) => {
        const token = res.locals.token
        res.cookie('authToken', token.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 * 1000,
            sameSite: 'lax'
        })
        res.locals.response = {
            res_code: '0000',
            res_desc: 'User login successfully',
            data: {
                accessToken: token.accessToken
            }
        }
        res.json(res.locals.response)
        next()
    }
)

router.post(
    '/refresh-token', 
    refreshToken(),
    (req: Request, res: Response, next:NextFunction) => {
        const token = res.locals.token
        res.cookie('authToken', token.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 * 1000,
            sameSite: 'lax'
        })
        res.locals.response = {
            res_code: '0000',
            res_desc: 'RefreshToken successfully',
            data: {
                newAccessToken: token.accessToken
            }
        }
        res.json(res.locals.response)
        next()
    }
 )

router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    findUserPermission(),
    (req: Request, res: Response, next: NextFunction) => {
        res.locals.response = {
            res_code: '0000',
            res_desc: '',
            user: res.locals.user
        }
        res.json(res.locals.response)
        next()
    }
)


router.post(
    '/logout',
     logout,
     (req: Request, res: Response, next: NextFunction) => {
         res.locals.response = {
            res_code: '0000',
            res_desc: 'Logout Success',
            data: {}
        }
        res.json(res.locals.response)
        next()
     }
    );

router.get(
    '/test',
    (req: Request, res: Response, next: NextFunction) => {
        res.json({ user: req.user });
    }
)

export default router;