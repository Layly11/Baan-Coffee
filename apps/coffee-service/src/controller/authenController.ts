import express, { Request, Response, NextFunction } from 'express';
import * as jose from 'jose'
import { UserModel } from '@coffee/models'
import {ServiceError} from '@coffee/helpers'
import AuthenMasterError from '../constants/errors/authen.error.json'
import winston from '../helpers/winston'

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
    const newUser = await UserModel.create({ username, email, password })

    res.locals.newUser = newUser
    next()
  } catch (error) {
    next(error)
  }
}

export const login = () => async (req: Request, res: Response, next:NextFunction) => {
  const {email, password } = req.body

  if(!email || !password){
    return next(new ServiceError(AuthenMasterError.ERR_USER_LOGIN_REQUIRED))
  }

  try{
    const user = await UserModel.findOne({where: { email }})
    if(!user){
      return next(new ServiceError(AuthenMasterError.ERR_LOGIN_USER_INVALID))
    }

    const isMatch = await user.matchPassword(password)
    if(!isMatch){
      return next(new ServiceError(AuthenMasterError.ERR_LOGIN_USER_INVALID))
    }

    const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET)
    const token = await new jose.SignJWT({
      id: user.id,
      username: user.username,
      email: user.email
    })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN!)
    .sign(jwtSecret)

    res.locals.token = token
    next()
  }catch (error) {
    next(error)
  }
}