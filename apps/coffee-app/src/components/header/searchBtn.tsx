import ButtonWrapper from '../commons/button'
import React, { JSX } from 'react'

const SearchButton = (
  {
    handleOnClickSearch,
    isFetching,
    label = 'Search',
    color
  }: {
    handleOnClickSearch: () => Promise<void>
    isFetching: boolean
    label?: string
    color?: string
  }
): JSX.Element => (
  <ButtonWrapper
    $primaryalt={color !== 'authen'}
    $authen={color === 'authen'}
    onClick={
    () => {
      handleOnClickSearch().catch((e) => {
        console.error(e)
      })
    }
  }
    $loading={isFetching}
  >
    {isFetching
      ? <i className='fas fa-spinner fa-spin' />
      : <i className='fas fa-search' />}
    &nbsp;<span style={{ marginLeft: '2px' }}>{label}</span>
  </ButtonWrapper>
)

export { SearchButton }
