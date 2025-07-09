import { dayjs } from '../../helpers/dayjs'

export const DateFormat = (date: string): string => {
  if (date === null || date === undefined || date === '') {
    return '-'
  }
  const formattedDate = dayjs(date).tz().format('DD/MM/YYYY')
  return formattedDate === 'Invalid Date' ? '-' : formattedDate
}

export const TimeFormat = (date: string): string => {
  if (date === null || date === undefined || date === '') {
    return '-'
  }
  const formattedDate = dayjs(date).tz().format('HH:mm:ss')
  return formattedDate === 'Invalid Date' ? '-' : formattedDate
}

export const DateTimeFormat = (date: string | Date): string => {
  if (date === null || date === undefined || date === '') {
    return '-'
  }

  const formattedDate = dayjs(date).tz().format('DD/MM/YYYY HH:mm:ss')
  return formattedDate === 'Invalid Date' ? '-' : formattedDate
}
