import express, { NextFunction, Request, Response } from "express";
import { urlencoded } from 'body-parser'
import session from "express-session";
import RedisStore from 'connect-redis';
import {getRedisClient} from './helpers/redis'
import passport from "./helpers/passport";
import routers from './routers'
import { createRequestLog, createResponseLog, createErrorLog } from './controller/logController'
import cookieParser from 'cookie-parser';
import cors from 'cors'


const APP = () => {
const app = express()

app.set('trust proxy', true)
app.enable('trust proxy')

app.disable('x-powered-by')

app.use(cors({
  origin: 'http://localhost:9301',
  credentials: true           
}));

app.use(express.json());
app.use(urlencoded({ extended: true }))

app.use(cookieParser(process.env.COOKIE_SECRET))

const redisClient = getRedisClient();

const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'mycoffee:',
    ttl: 60 * 60 * 1000
});
app.use(session({
    secret: process.env.COOKIE_SECRET!,
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session())


app.use(createRequestLog())


app.use(routers)

app.use(createResponseLog())
app.use(createErrorLog())

return app

}

export default APP