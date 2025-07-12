import React, { JSX } from 'react'
import { type ControlProps, type OptionProps, components, type MultiValueGenericProps } from 'react-select'

export const componentControl = (controlProps: ControlProps, props: { icon: string, iconAlign: 'left' | 'right' }): JSX.Element => {
  return (
    <components.Control {...controlProps}>
      {props.iconAlign === 'left' && <i className={props.icon} style={{ marginRight: '10px', color: '#92a3b9' }} />}
      {controlProps.children}
      {props.iconAlign === 'right' && <i className={props.icon} style={{ marginLeft: '10px', color: '#92a3b9' }} />}
    </components.Control>
  )
}

export const componentOption = (optionProps: OptionProps, props: { isShowCheckbox: boolean }): JSX.Element => {
  return (
    <components.Option {...optionProps}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginLeft: '10px' }}>
        {optionProps.children}
        {props.isShowCheckbox &&
          <input
            type='checkbox'
            checked={optionProps.isSelected}
            onChange={() => null}
            style={{ accentColor: 'rgb(166, 130, 230)', border: '10px solid rgb(129, 111, 194)', marginRight: '8px' }}
          />}
      </div>
    </components.Option>
  )
}

export const componentMultiValueContainer = (multiValueGenericProps: MultiValueGenericProps<any>): JSX.Element => {
  return (
    <div>
      <components.MultiValueContainer {...multiValueGenericProps}>
        {multiValueGenericProps.children}
      </components.MultiValueContainer>
    </div>
  )
}
