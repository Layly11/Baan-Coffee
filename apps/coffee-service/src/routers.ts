import { Router } from 'express'
import authenRoute from './routes/authRouter'
import dashboardRoute from './routes/dashboardRouter'
const router = Router()

router.use('/authen', authenRoute )
router.use('/dashboard', dashboardRoute)

export default router