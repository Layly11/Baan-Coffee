import express, { NextFunction, Request, Response } from "express";
import { urlencoded } from 'body-parser'
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


app.use(express.json());
app.use(urlencoded({ extended: true }))

app.use(cookieParser(process.env.COOKIE_SECRET))

app.use(passport.initialize());

app.use(createRequestLog())


app.use(routers)

app.use(createResponseLog())
app.use(createErrorLog())

return app

}

export default APP