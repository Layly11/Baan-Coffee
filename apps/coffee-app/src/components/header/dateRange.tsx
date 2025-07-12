import React, { JSX } from 'react'
import dayjs from 'dayjs'
import DatePickerRange, { parseMaxEndDate } from '../commons/datePickerRange'

interface IDateRange {
  startDate: Date | null
  setStartDate: (startDate: Date | null) => void
  endDate: Date | null
  setEndDate: (endDate: Date | null) => void
  limitMaxDate?: number
}
const DateRange = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  limitMaxDate
}: IDateRange): JSX.Element => {

  const onDatesChange = ([start, end]: [Date | null, Date | null]): void => {
    if (start !== null) {
      setStartDate(start)
      setEndDate(end)
    }

    if (start !== null && end !== null) {
      if (dayjs(start).isValid() && dayjs(end).isValid()) {
        setStartDate(start)
        setEndDate(end)
      }
    }
  }

  const onCalendarClose = (): void => {
    if (dayjs(startDate).isValid() && !dayjs(endDate).isValid()) {
      const maxEndDate = parseMaxEndDate({ startDate })
      setEndDate(maxEndDate)
    }
  }

  return (
    <DatePickerRange
      icon='far fa-calendar'
      startDate={startDate}
      endDate={endDate}
      onDatesChange={onDatesChange}
      onCalendarClose={onCalendarClose}
    />
  )
}

export { DateRange }
