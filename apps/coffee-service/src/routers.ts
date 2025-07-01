import { Router } from 'express'
import authenRoute from './routes/authRouter'
const router = Router()

router.use('/authen', authenRoute )

export default router