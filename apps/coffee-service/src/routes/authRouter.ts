import express, { Request, Response, NextFunction } from 'express';
import passport, { session } from 'passport';
import { register, login } from '../controller/authenController'
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
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 1000,
        })
        res.locals.response = {
            res_code: '0000',
            res_desc: 'User login successfully',
            data: {}
        }
        res.json(res.locals.response)
        next()
    }
)

router.get(
    '/profile',
    passport.authenticate('jwt', { failureMessage: true }),
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

router.post('/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  res.json({ message: 'Logged out' });
});

router.get(
    '/test',
    (req: Request, res: Response, next: NextFunction) => {
        res.json({ user: req.user });
    }
)

export default router;