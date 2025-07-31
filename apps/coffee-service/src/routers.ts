import { Router } from 'express'
import authenRoute from './routes/authRouter'
import dashboardRoute from './routes/dashboardRouter'
import productRoute from './routes/productRouter'
import customerRouter from './routes/customerRouter'
const router = Router()

router.use('/authen', authenRoute)
router.use('/dashboard', dashboardRoute)
router.use('/products', productRoute)
router.use('/customer', customerRouter)

export default router