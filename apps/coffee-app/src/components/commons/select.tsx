import React, { JSX } from 'react'
import { useSelector } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import type { UseSelectorProps } from '../../props/useSelectorProps'
import Select, { type ActionMeta, type StylesConfig } from 'react-select'
import { componentControl, componentOption, componentMultiValueContainer } from './selectComponents'

interface SelectProps extends React.HTMLAttributes<HTMLSelectElement | HTMLOptionElement> {
  icon: string
  classNamePrefix?: string
  iconAlign?: 'left' | 'right'
  placeholder?: string
  defaultValue?: any
  value?: number | string | string[] | null
  onChange: (selectedOption: any, actionMeta?: ActionMeta<any>) => void
  disabled?: boolean
  required?: boolean
  options: Array<{ value: number | string, label: string }>
  isSearchable?: boolean
  isMulti?: boolean
  isClearable?: boolean
  hideSelectedOptions?: boolean
  closeMenuOnSelect?: boolean
  isShowCheckbox?: boolean
}

export interface ISelectOption {
  value: string
  label: string
}

const Selects = ({
  icon,
  iconAlign = 'left',
  placeholder,
  defaultValue,
  value,
  onChange,
  disabled,
  required,
  options,
  isSearchable,
  isMulti,
  isClearable,
  hideSelectedOptions,
  closeMenuOnSelect,
  isShowCheckbox = false,
  classNamePrefix
}: SelectProps): JSX.Element => {
  return (
      <Select
        defaultValue={defaultValue}
        placeholder={placeholder}
        value={
          (value !== null && value !== '')
            ? options?.filter(option => Array.isArray(value)
              ? value.includes(String(option.value))
              : [value].includes(option.value))
            : null
        }
        onChange={onChange}
        options={options}
        required={required}
        isDisabled={disabled}
        classNamePrefix={classNamePrefix ?? 'react-select'}
        menuPortalTarget={document.body}
        styles={StyleSelect()}
        components={{
          Control: (controlProps) => componentControl(controlProps, { icon, iconAlign }),
          Option: (optionProps) => componentOption(optionProps, { isShowCheckbox }),
          MultiValueContainer: (multiValueGenericProps) => componentMultiValueContainer(multiValueGenericProps)
        }}
        menuPosition='fixed'
        isSearchable={isSearchable}
        isMulti={isMulti}
        isClearable={isClearable}
        hideSelectedOptions={hideSelectedOptions}
        closeMenuOnSelect={closeMenuOnSelect}
      />
  )
}

const StyleSelect = (): StylesConfig => ({
  control: (styles) => ({
    ...styles,
    backgroundColor: '#fafbfd',
    width: '100%',
    height: '35px',
    minHeight: '35px',
    fontSize: '0.875em',
    padding: '0px 20px 0px 10px',
    boxSizing: 'border-box',
    borderRadius: '10px',
    border: '1px solid #e2e9f2',
    boxShadow: 'none',
    color: '#3B5475',
    '&:focus-within': {
      border: '1px solid #e2e9f2'
    },
    '&:hover': {
      border: '2px solid #e2e9f2'
    },
    '&:isInvalid': {
      border: '2px solid #ea5455'
    }
  }),
  indicatorSeparator: (styles) => ({
    ...styles,
    display: 'none'
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    display: 'none'
  }),
  menu: (styles) => ({
    ...styles,
    marginTop: 0,
    borderRadius: '0 0 10px 10px',
    boxShadow: '0px 5px 10px rgba(0, 0, 0, 0.05)'
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999
  }),
  valueContainer: (style) => ({
    ...style,
    height: '100%',
    flexWrap: 'wrap',
    overflowY: 'auto',

    // hide scrollbar any browser
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE 10+
    '&::-webkit-scrollbar': { // Chrome, Safari
      display: 'none'
    }
  }),
  multiValue: (styles) => ({
    ...styles,
    borderRadius: '8px',
    backgroundColor: '#f3f3fc'
  }),
  option: (styles, props) => {
    const _props = props as unknown as { selectProps: any, isSelected: boolean }
    const classNamePrefix = _props.selectProps.classNamePrefix

    const customStyle = {
      ...styles,
      color: classNamePrefix === 'amount-range' ? '#aaa' : '#3B5475',
      backgroundColor: 'rgba(243, 248, 254, 0)',
      cursor: 'pointer',
      fontSize: '0.875em',
      '&:hover': {
        backgroundColor: 'rgba(243, 248, 254, 1)',
        color: '#555555'
      }
    }
    if (_props.isSelected) {
      if (classNamePrefix === 'amount-range') {
        customStyle.color = 'black'
        customStyle['&:hover'].backgroundColor = 'rgba(243, 248, 254, 1)'
      }
    }
    return customStyle
  },
  placeholder: (styles) => ({ ...styles, color: '#3B5475' })
})

export default Selects
