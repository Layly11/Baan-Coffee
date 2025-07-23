import ButtonWrapper from '../commons/button'
import React, { JSX } from 'react'

const ClearButton = (
  { handleOnClearSearch }: { handleOnClearSearch: () => void }
): JSX.Element => (
  <ButtonWrapper $dangeralt onClick={handleOnClearSearch}>
    <i className='fas fa-ban' />
    &nbsp;<span style={{ marginLeft: '2px' }}>Clear</span>
  </ButtonWrapper>
)

export { ClearButton }
