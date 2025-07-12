import styled from 'styled-components'
import React, { JSX } from 'react'
import Selects from './select'

const Pagination = styled.div`
  position: block;
  padding: 10px 20px;
  display: flex;
  margin: 10px 0px;
  align-items: center;
  justify-content: flex-end;
`

const Label = styled.div`
  margin-right: 10px;
  font-size: 0.875em;
  color: rgba(0, 0, 0, 1);
`

const Button = styled.button<{ $selected?: boolean }>`
  padding: 10px;
  margin-right: 3px;
  color: #0C2F5F;
  background: transparent;
  border: none;
  outline: none;
  &:disabled {
    cursor: default;
    color: rgba(0, 0, 0, 0.5);
  }
  &:disabled:hover {
    cursor: default;
    color: rgba(0, 0, 0, 0.5);
    padding: 0px 10px;
    border-radius: 10px;
    background: transparent;
    box-shadow: none;
  }
  &:hover {
    cursor: pointer;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    background: rgba(128, 61, 237, 0.5);
  }
  ${(props) =>
    props.$selected === true &&
    `
      cursor: default;
      padding: 4px 10px;
      border-radius: 4px;
      background: #DECEF8;
    `
  }
`

interface PageginatorProps {
  page: number
  setPage: (page: number) => Promise<void>
  total: number
  pageSize: number
  setPageSize: (pageSize: number) => void
  mockSize: number
}

const Pageginator = ({
  page,
  setPage,
  total,
  pageSize,
  setPageSize,
  mockSize
}: PageginatorProps): JSX.Element => {
  const PageRange = (start: number, end: number): number[] => {
    const range = []
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  }

  const totalPages = Math.ceil(total / mockSize)

  return (
    <Pagination>
      <Label>
        Rows per page
      </Label>
      <Label>
        <Selects
          icon='fas fa-chevron-down'
          iconAlign='right'
          value={pageSize}
          onChange={(selectedOption) => {
            if (setPageSize != null) { setPageSize(Number(selectedOption.value as string)) }
          }}
          options={[
            { value: 10, label: '10' },
            { value: 50, label: '50' },
            { value: 100, label: '100' }
          ]}
        />
      </Label>
      <Label>
        {total > 0 ? page * mockSize + 1 : 0} -{' '}
        {(page + 1) * mockSize > total ? total : (page + 1) * mockSize} of{' '}
        {total}
      </Label>
      <Button
        disabled={page === 0} onClick={() => {
          setPage(0).catch((err) => {
            console.error('Error setting page:', err)
          })
        }}
      >
        <i className='fas fa-chevron-left' />
        <i className='fas fa-chevron-left' />
      </Button>
      <Button
        disabled={page === 0} onClick={() => {
          setPage(page - 1).catch((err) => {
            console.error('Error setting page:', err)
          })
        }}
      >
        <i className='fas fa-chevron-left' />
      </Button>
      {PageRange(1, totalPages)
        .filter((pageNumber) => pageNumber >= page - 1 && pageNumber <= page + 3)
        .map((pageNumber) => (
          <Button
            key={pageNumber}
            $selected={page + 1 === pageNumber}
            onClick={() => {
              if (pageNumber - 1 === page) return
              setPage(pageNumber - 1).catch((err) => {
                console.error('Error setting page:', err)
              })
            }}
          >
            {pageNumber}
          </Button>
        ))}
      {totalPages - page > 5 && (
        <Button disabled>
          ...
        </Button>
      )}
      {page + 5 < totalPages && (
        <Button
          disabled={page + 1 === totalPages}
          onClick={() => {
            setPage(totalPages - 1).catch((err) => {
              console.error('Error setting page:', err)
            })
          }}
        >
          {totalPages}
        </Button>
      )}
      <Button
        disabled={(page + 1) * pageSize >= total}
        onClick={() => {
          setPage(page + 1).catch((err) => {
            console.error('Error setting page:', err)
          })
        }}
      >
        <i className='fas fa-chevron-right' />
      </Button>
      <Button
        disabled={(page + 1) * pageSize >= total}
        onClick={() => {
          setPage(totalPages - 1).catch((err) => {
            console.error('Error setting page:', err)
          })
        }}
      >
        <i className='fas fa-chevron-right' />
        <i className='fas fa-chevron-right' />
      </Button>
    </Pagination>
  )
}

export default Pageginator
