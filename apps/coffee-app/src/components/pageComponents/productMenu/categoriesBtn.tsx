import ButtonWrapper from '../../commons/button'
import React, { JSX } from 'react'

interface CategoriesButtonProps {
  onClick: () => void
}

const CategoriesButton = ({ onClick }: CategoriesButtonProps): JSX.Element => {
  return (
    <ButtonWrapper $successalt onClick={onClick}>
      <i className='fas fa-plus' />
      &nbsp;<span style={{ marginLeft: '2px' }}>Add Category</span>
    </ButtonWrapper>
  )
}

export { CategoriesButton }
