import ButtonWrapper from '../../commons/button'
import React, { JSX } from 'react'

interface CategoriesButtonProps {
  onClick: () => void
}

const CategoriesButton = ({ onClick }: CategoriesButtonProps): JSX.Element => {
  return (
    <ButtonWrapper $successalt onClick={onClick}>
      <i className='fas fa-plus' />&nbsp; Add Categories
    </ButtonWrapper>
  )
}

export { CategoriesButton }
