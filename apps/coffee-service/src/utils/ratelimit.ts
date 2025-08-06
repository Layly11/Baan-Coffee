import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import { getRedisClient } from '../helpers/redis'

export const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: {
        res_code: '0499',
        res_desc: 'Too many OTP attempts. Please try again later.'
      },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `otp:${req.body?.email || req.ip}`,
    store: new RedisStore({
        sendCommand: async (...args: string[]) => {
          const redis = getRedisClient()
          return redis.sendCommand(args)
        }
      })  
})

export const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 10,
    message: {
      res_code: "0488",
      res_desc: "Too many login attempts. Please try again in 10 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `login:${req.body?.email || req.ip}`,
    store: new RedisStore({
      sendCommand: async (...args: string[]) => {
        const redis = getRedisClient()
        return redis.sendCommand(args)
      }
    })
  })