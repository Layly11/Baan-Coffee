import ButtonWrapper from '../../commons/button'
import React, { JSX } from 'react'

interface AddButtonProps {
  onClick: () => void
}

const AddButton = ({ onClick }: AddButtonProps): JSX.Element => {
  return (
    <ButtonWrapper $secondaryalt onClick={onClick}>
      <i className='fas fa-plus' />&nbsp; Add Item
    </ButtonWrapper>
  )
}

export { AddButton }
