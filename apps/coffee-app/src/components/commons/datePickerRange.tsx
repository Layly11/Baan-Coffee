import dayjs from 'dayjs'
import { JSX } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'


const Container = styled.div`
  display: flex;
  padding: 0px 20px 0px 10px;
  justify-content: center;
  align-items: center;
  width: auto;
  height: 35px;
  border: 1px solid #e2e9f2;
  border-radius: 10px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
  background-color: #fafbfd;
  .react-datepicker-wrapper {
    /* width: 100%; */
    input {
      font-size: 0.875rem;
      color: #3B5475 ;
      background-color: #fafbfd;
    }
  }
  .react-datepicker-popper {
    z-index: 2;
    inline: 0;
  }
  > i {
    color: #92a3b9;
    margin-right: 10px;
    transition: all 0.2s;
  }
  > img {
    padding: 0px 8px;
  }
  &:focus-within {
    border: 2px solid #92a3b9;
    > i {
      color: #3B5475;
    }
  }
  @media (max-width: 1024px) {
    padding: 10px;
    .react-datepicker-wrapper {
      input {
        font-size: 0.8em;
      }
    }
    span {
      padding: 0px 5px 0px 5px;
    }
    .daterange {
      gap: 0px;
    }
  }
  @media (max-width: 992px) {
    width: 100%;
    padding: 0px 10px;
  }
`

interface DatePickerRangeProps {
    icon: string
    startDate?: Date | null
    endDate?: Date | null
    onDatesChange: (date: [Date | null, Date | null]) => void
    onCalendarClose?: () => void
}

export const parseMaxEndDate = ({ startDate }: Pick<DatePickerRangeProps, 'startDate'>): Date | null => {
  let maxEndDate: Date | null = dayjs().toDate()
  if (startDate != null) {
    maxEndDate = dayjs(startDate).add(30, 'day').toDate()
    if (dayjs(maxEndDate).isAfter(dayjs())) maxEndDate = dayjs().toDate()
  }
  return maxEndDate
}


const DatePickerRange = ({
    startDate,
    endDate,
    onDatesChange,
    onCalendarClose,
}: DatePickerRangeProps): JSX.Element => {

    let minStartDate = dayjs().subtract(366, 'day').toDate()
    let maxEndDate = dayjs().toDate()

    const maxRangeEndDate = parseMaxEndDate({ startDate }) !== null && dayjs(parseMaxEndDate({ startDate })).isBefore(maxEndDate)
        ? parseMaxEndDate({ startDate })
        : maxEndDate

    const handleStartDateChange = (date: Date | null): void => {
        if (date == null) {
            onDatesChange([null, null])
            return
        }
        if (endDate == null || dayjs(date).isAfter(endDate) || dayjs(endDate).diff(date, 'day') > 30) {
            endDate = dayjs(date).add(30, 'day').toDate()
        }
        endDate = dayjs(endDate).isAfter(maxEndDate) ? maxEndDate : endDate
        onDatesChange([date, endDate ?? null])
        const handleEndDateChange = (date: Date | null): void => {
            onDatesChange([startDate ?? null, date])
        }
    }

    const handleEndDateChange = (date: Date | null): void => {
        onDatesChange([startDate ?? null, date])
    }

    return (
        <Container>
            <img src='/date.svg' />
            <div className='daterange'>
                <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    startDate={startDate ?? undefined}
                    endDate={endDate ?? undefined}
                    dateFormat='dd/MM/yyyy'
                    maxDate={maxEndDate}
                    minDate={minStartDate}
                    onCalendarClose={onCalendarClose}
                />
                <span>-</span>
                <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    startDate={startDate ?? undefined}
                    endDate={endDate ?? undefined}
                    dateFormat='dd/MM/yyyy'
                    maxDate={maxRangeEndDate ?? undefined}
                    minDate={startDate ?? undefined}
                    onCalendarClose={onCalendarClose}
                />
            </div>
        </Container>
    )
}

export default DatePickerRange