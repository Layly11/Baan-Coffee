import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import tz from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(utc)
dayjs.extend(tz)
dayjs.extend(isBetween)
dayjs.extend(customParseFormat)

dayjs.tz.setDefault('Asia/Bangkok')

export { dayjs }
