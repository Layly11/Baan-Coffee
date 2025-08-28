import { NextFunction, Request, Response, Router } from 'express'
import authenRoute from './routes/authRouter'
import dashboardRoute from './routes/dashboardRouter'
import productRoute from './routes/productRouter'
import profileRouter from './routes/profileRouter'
import cartRouter from './routes/cartRouter'
import { RedisClientType } from 'redis'
import createCustomerRouter from './routes/customerRouter'

export default function createRouters({ redis }: { redis: RedisClientType }) {
    const router = Router()

    router.use('/authen', authenRoute)
    router.use('/dashboard', dashboardRoute)
    router.use('/products', productRoute)
    router.use('/customer', createCustomerRouter({ redis }))
    router.use('/profile', profileRouter)
    router.use('/cart', cartRouter)
    router.use('/', (req:Request, res: Response, next: NextFunction) => {
        res.send("Hello World")
    })
    

    return router

}