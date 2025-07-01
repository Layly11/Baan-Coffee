import winston, { format } from 'winston'

const { printf } = format

const myFormat = printf((info: any) => {
    return JSON.stringify({
        level: info.level,
        message: {
            ...info,
            level: undefined
        }
    })
})

export function createLogger () {
    const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        myFormat
      )
    })
  ]

  const logger = winston.createLogger({
    transports,
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })

  return logger
}

const logger = createLogger()

export default logger