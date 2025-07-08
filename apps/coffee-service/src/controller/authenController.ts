import express, { Request, Response, NextFunction } from 'express';
import * as jose from 'jose'
import { UserModel } from '@coffee/models'
import { ServiceError } from '@coffee/helpers'
import AuthenMasterError from '../constants/errors/authen.error.json'
import winston from '../helpers/winston'
import validator from 'validator';
import USER_ROLE from '../constants/masters/userRole.json'
import { getRedisClient } from '../helpers/redis'

export const register = () => async (req: Request, res: Response, next: NextFunction) => {
  const { username, email, password } = req.body
  if (!username || !email || !password) {
    winston.error('User registration failed: Missing required fields')
    return next(new ServiceError(AuthenMasterError.ERR_USER_REGISTER_REQUIRED))
  }
  try {
    const existingUser = await UserModel.findOne({ where: { email } })
    if (existingUser) {
      return next(new ServiceError(AuthenMasterError.ERR_REGISTER_USER_EXIST))
    }
    if (!validator.isEmail(email)) {
      return next(new ServiceError(AuthenMasterError.ERR_REGISTER_USER_EMAIL_INVALID))
    }
    const newUser = await UserModel.create({ username, email, password, role_id: USER_ROLE.CASHIER.id })

    res.locals.newUser = newUser
    next()
  } catch (error) {
    next(error)
  }
}

export const login = () => async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    return next(new ServiceError(AuthenMasterError.ERR_USER_LOGIN_REQUIRED))
  }

  try {

    const user = await UserModel.findOne({ where: { email } })
    const redis = getRedisClient()
    if (!user) {
      return next(new ServiceError(AuthenMasterError.ERR_LOGIN_USER_INVALID))
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return next(new ServiceError(AuthenMasterError.ERR_LOGIN_USER_INVALID))
    }

    user.last_login = user.recent_login
    user.recent_login = new Date()
    await user.save()

    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET)
    const jwtRefreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
    const header = { alg: 'HS256', typ: 'JWT' }

    const accessToken = await new jose.SignJWT({
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id
    })
      .setProtectedHeader(header)
      .setIssuedAt()
      .setExpirationTime('1m')
      .sign(jwtSecret)

    const refreshToken = await new jose.SignJWT({
      id: user.id,
      username: user.username,
    })
      .setProtectedHeader(header)
      .setIssuedAt()
      .setExpirationTime('2m')
      .sign(jwtRefreshSecret)

    await redis.sAdd(`refreshTokens:${user.id}`, refreshToken);
    await redis.expire(`refreshTokens:${user.id}`, 60 * 60 * 24 * 7);



    res.locals.token = {
      accessToken,
      refreshToken
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const refreshToken = () => async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.authToken;

  if (!refreshToken) return next(new ServiceError(AuthenMasterError.ERR_REFRESH_TOKEN_NOT_FOUND))

  try {
    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET)
    const jwtRefreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
    const { payload } = await jose.jwtVerify(refreshToken, jwtRefreshSecret)
    const userId = payload.id as string

    const redis = getRedisClient()
    const isTokenExist = await redis.sIsMember(`refreshTokens:${userId}`, refreshToken)
    if (!isTokenExist) {
      return next(new ServiceError(AuthenMasterError.ERR_REFRESH_TOKEN_NOT_FOUND))
    }

    await redis.sRem(`refreshTokens:${userId}`, refreshToken);

    const user = await UserModel.findOne({ where: { id: userId } })

    if (!user) {
      return next(new ServiceError(AuthenMasterError.ERR_LOGIN_USER_INVALID))
    }

    const newAccessToken = await new jose.SignJWT({
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_EXPIRES_IN!)
      .sign(jwtSecret)

    const newRefreshToken = await new jose.SignJWT({
      id: user.id,
      username: user.username,
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN!)
      .sign(jwtRefreshSecret)

    await redis.sAdd(`refreshTokens:${userId}`, newRefreshToken);
    await redis.expire(`refreshTokens:${userId}`, 60 * 60 * 24 * 7);

    res.locals.token = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    }
    next()
  } catch (error) {
    next(error)
  }
}

export const logout = () => async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.authToken
  const redis = getRedisClient()
  if (!refreshToken) return next(new ServiceError(AuthenMasterError.ERR_REFRESH_TOKEN_NOT_FOUND))

  try {
    const jwtRefreshSecret = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET)
    const { payload } = await jose.jwtVerify(refreshToken, jwtRefreshSecret)
    await redis.sRem(`refreshTokens:${payload.id}`, refreshToken);


    res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
    next()

  } catch (error) {
    next(error)
  }
}

export const checkAvailability = () => async (req: Request, res: Response, next: NextFunction) => {
  const {email, username} = req.query 
  let checkExist: {emailTaken: boolean | null, usernameTaken: boolean|null} = {emailTaken: null, usernameTaken: null}
  try{
    if(email) {
      const emailStr = email as string
      const user = await UserModel.findOne({ where: { email: emailStr } })
      checkExist.emailTaken = !!user
    }
     if (username) {
      const usernameStr = username as string
      const user = await UserModel.findOne({ where: { username: usernameStr } })
      checkExist.usernameTaken = !!user
    }

    res.locals.checkExist = checkExist
    next()
  } catch (err) {
    next(err)
  }
}