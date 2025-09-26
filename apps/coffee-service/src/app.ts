import express, { NextFunction, Request, Response } from "express";
import { urlencoded } from 'body-parser'
import passport from "./helpers/passport";
import createRouters from './routers'
import { createRequestLog, createResponseLog, createErrorLog } from './controller/logController'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { RedisClientType } from "redis";


const APP = ({ redis }: { redis: RedisClientType }) => {
    const app = express()
    app.use(cors({
    origin: 'https://baan-coffee-coffee-app.vercel.app', 
    credentials: true,
}));

    app.set('trust proxy', true)
    app.enable('trust proxy')

    app.disable('x-powered-by')


    app.use(express.json());
    app.use(urlencoded({ extended: true }))

    app.use(cookieParser(process.env.COOKIE_SECRET))

    app.use(passport.initialize());

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.header('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate')
        next()
    })

    app.use(createRequestLog())

    app.get('/', (req: Request, res: Response, next: NextFunction) => {
        res.send("Welcome to Server BaanCoffee!!!🛜")
        next()
    })


    // app.get('/payment/result', (req: Request, res: Response, next: NextFunction) => {
    //     res.redirect()
    //     next()
    // })

    app.use(createRouters({ redis }))

    app.use(createResponseLog())
    app.use(createErrorLog())

    return app

}

export default APP