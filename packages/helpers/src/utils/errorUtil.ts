import { FieldValidationError } from 'express-validator'

export class ValidationError extends Error {
  statusCode: number
  resCode: string
  resDesc: Record<string, string>
  details: FieldValidationError[]
  constructor (error: { statusCode: number, resCode: string, resDesc: Record<string, string>, details: FieldValidationError[] }) {
    super()
    this.name = 'Validation Error'
    this.statusCode = error.statusCode
    this.resCode = error.resCode
    this.resDesc = error.resDesc
    this.details = error.details
  }
}


export class ServiceError extends Error {
  statusCode: number
  resCode: string
  resDesc: Record<string, string>
  additional?: any
  constructor (error: {
    statusCode: number
    resCode: string
    resDesc: Record<string, string>
    additional?: any
  }) {
    super()
    this.name = 'Service Error'
    this.statusCode = error.statusCode
    this.resCode = error.resCode
    this.resDesc = error.resDesc
    this.additional = error.additional
  }
}

export class InternalServiceError extends Error {
  statusCode: number
  resCode: string
  resDesc: string
  constructor (error: {
    resCode: string
    resDesc: string
  }) {
    super()
    this.name = 'Internal Service Error'
    this.statusCode = 500
    this.resCode = error.resCode
    this.resDesc = error.resDesc
  }
}