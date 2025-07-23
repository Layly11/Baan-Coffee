import { Router } from 'express'
import authenRoute from './routes/authRouter'
import dashboardRoute from './routes/dashboardRouter'
import productRoute from './routes/productRouter'
const router = Router()

router.use('/authen', authenRoute)
router.use('/dashboard', dashboardRoute)
router.use('/products', productRoute)

export default router