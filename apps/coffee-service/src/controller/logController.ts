import { NextFunction, Request, Response } from 'express'
import moment from 'moment'
import { nanoid } from 'nanoid'
import winston from '../helpers/winston'
import { ServiceError, InternalServiceError, ValidationError } from '@coffee/helpers'

export const createRequestLog = () => (req: Request, res: Response, next: NextFunction) => {
    res.locals.requestId = req.headers['x-request-uid'] as string || nanoid()
    res.locals.requestTime = moment()

    winston.info(
        'Request ' +
        `${res.locals.requestId} ` +
        `${req.method} ` +
        `${req.originalUrl} ` +
        `${req.ip} ` +
        `${req.headers['user-agent']}`,
        {
            appName: 'Coffee-shop',
            source: 'coffee-service',
            requestId: res.locals.requestId,
            type: 'request',
            method: req.method,
            url: req.originalUrl,
            req: {
                headers: JSON.stringify(JSON.parse(JSON.stringify(req.headers))),
                body: JSON.stringify(req.body),
                params: JSON.stringify(JSON.parse(JSON.stringify(req.params))),
                query: JSON.stringify(req.query)
            }

        }
    )
    next()
}

export const createResponseLog = () => (req: Request, res: Response, next: NextFunction) => {
    const requestUID = res.locals.requestId
    const requestTime = res.locals.requestTime
    const body = res.locals.body
    const user = req.user as any

    const responseTime = moment().diff(requestTime, 'milliseconds')

    winston.info(
        'Response ' +
        `${requestUID} ` +
        `${req.method} ` +
        `${req.originalUrl} ` +
        `${res.statusCode} ` +
        `${responseTime}ms`,
        {
            requestUID,
            type: 'response',
            method: req.method,
            url: req.originalUrl,
            appName: 'Coffee-Shop',
            source: 'Coffee-service',
            resp: {
                status: res.statusCode,
                time: responseTime,
                timeUnit: 'ms',
                headers: JSON.stringify(res.getHeaders()),
                body: JSON.stringify(body)
            },
            rmid: user?.staff_id || null
        }
    )
    next()
}

export const createErrorLog = () => (err: Error, req: Request, res: Response, next: NextFunction) => {
  const requestUID = res.locals.requestId
  const requestTime = res.locals.requestTime
  const functionName = res.locals.functionName

  if (err instanceof ServiceError || err instanceof ValidationError || err instanceof InternalServiceError) {
    let resDesc = (err instanceof InternalServiceError) ? err.resDesc : err.resDesc.th
    if (err instanceof ValidationError) {
      resDesc += `: ${err.details[0].msg ? err.details[0].msg : err.details[0].path}`
    }
    res.status(err.statusCode).json({
      request_uid: requestUID,
      res_code: err.resCode,
      res_desc: resDesc
    })
  } else {
    res.status(500).json({
      request_uid: requestUID,
      res_code: '0500',
      res_desc: 'Internal Server Error'
    })
  }

  const responseTime = moment().diff(requestTime, 'milliseconds')

  winston.error(
    'Response ' +
    `${res.locals.requestId} ` +
    `${req.method} ` +
    `${req.originalUrl} ` +
    `${res.statusCode} ` +
    `${responseTime}ms`,
    {
      requestUID,
      type: 'response',
      method: req.method,
      url: req.originalUrl,
      functionName,
      appName: 'Coffee-Shop',
      source: 'Coffee-service',
      resp: {
        status: res.statusCode,
        time: responseTime,
        timeUnit: 'ms',
        headers: JSON.stringify(res.getHeaders())
      },
      error: {
        message: JSON.stringify(err),
        stack: JSON.stringify(err.stack)
      }
    }
  )
}
