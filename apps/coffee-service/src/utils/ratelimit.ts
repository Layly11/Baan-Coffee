import rateLimit,  { ipKeyGenerator } from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { getRedisClient } from '../helpers/redis'

export const getOtpLimiter = () => {
  const redis = getRedisClient()
  return rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: {
      res_code: '0499',
      res_desc: 'Too many OTP attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req:any) => `otp:${req.body?.email || ipKeyGenerator(req)}`,
    store: new RedisStore({
      sendCommand: async (...args: string[]) => redis.sendCommand(args),
    })
  })
}


export const getLoginLimiter = () => {
  const redis = getRedisClient()
  return rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: {
      res_code: "0488",
      res_desc: "Too many login attempts. Please try again in 10 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req:any) => `login:${req.body?.email || ipKeyGenerator(req)}`,
    store: new RedisStore({
      sendCommand: async (...args: string[]) => redis.sendCommand(args),
    })
  })
}


export const getResetOtpLimiter = () => {
  const redis = getRedisClient()
  return rateLimit({
    windowMs: 10 * 60 * 1000, // 10 นาที
    max: 5, // จำกัดได้สูงสุด 5 ครั้งในช่วงเวลานั้น
    message: {
      res_code: '0477',
      res_desc: 'Too many password reset requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: any) =>
      `reset_otp_limit:${req.body?.email || ipKeyGenerator(req)}`,
      store: new RedisStore({
      sendCommand: async (...args: string[]) => redis.sendCommand(args),
    }),
  })
}