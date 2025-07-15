import React, { JSX } from 'react'
import Selects from '../commons/select'
import { type ActionMeta, type SingleValue, type MultiValue } from 'react-select'

interface StatusDataProps {
  placeholder?: string
  defaultValue?: any
  value: string | string[] | null
  setValue: (value: any) => void
  jsonList: Record<string, any>
  isSearchable?: boolean
  isMulti?: boolean
  isClearable?: boolean
  hideSelectedOptions?: boolean
  closeMenuOnSelect?: boolean
  isShowCheckbox?: boolean
  selectAll?: {
    label: string
  }
}

interface Option {
  value: string
  label: string
}
const isLastItemIsSelectAll = (_newValue: MultiValue<Option>): boolean => {
  return _newValue[_newValue.length - 1].value === '*'
}
const isFullyOptions = (_newValue: MultiValue<Option>, _options: Option[]): boolean => {
  return _newValue.length === _options.length
}
const isUnCheckSelectAll = (actionMeta: ActionMeta<Option>, _newValue: MultiValue<Option>, _options: Option[]): boolean => {
  return (actionMeta.action === 'deselect-option' || actionMeta.action === 'remove-value') && _newValue.every((op) => _options.map((op) => op.value).includes(op.value))
}
const isUnCheckSomeOption = (actionMeta: ActionMeta<Option>, _newValue: MultiValue<Option>): boolean => {
  return (actionMeta.action === 'deselect-option' || actionMeta.action === 'remove-value') && _newValue[_newValue.length - 1].value === '*'
}
const isSelectSomeOption = (actionMeta: ActionMeta<Option>): boolean => {
  return actionMeta.action === 'select-option'
}
const SelectData = ({
  placeholder,
  defaultValue,
  value,
  setValue,
  jsonList,
  isSearchable,
  isMulti,
  isClearable,
  hideSelectedOptions,
  closeMenuOnSelect,
  isShowCheckbox,
  selectAll
}: StatusDataProps): JSX.Element => {
  const options: Option[] = [
    ...Object.keys(jsonList).map((key) => ({
      value: key,
      label: jsonList[key].label
    }))
  ]

  let customOptions = options
  if (selectAll !== undefined) {
    customOptions = [...options, { value: '*', label: selectAll.label }]
  }

  const handleChange = (
    newValue: SingleValue<Option> | MultiValue<Option>,
    actionMeta: ActionMeta<Option> | undefined
  ): void => {
    let _newValue: MultiValue<Option> = []
    if (newValue !== null) {
      if (!Array.isArray(newValue)) {
        const val = newValue as Option
        setValue(val.value)
        return
      } else if (Array.isArray(newValue)) {
        _newValue = newValue
      }
    }
    const _actionMeta = actionMeta as unknown as ActionMeta<Option>

    let result: string[] = []
    result = _newValue.map((item) => item.value)

    if (_newValue.length > 0) {
      if (isLastItemIsSelectAll(_newValue)) result = customOptions.map((item) => item.value)

      if (isFullyOptions(_newValue, options)) {
        if (isUnCheckSelectAll(_actionMeta, _newValue, options)) {
          result = []
        } else if (isUnCheckSomeOption(_actionMeta, _newValue)) {
          result = _newValue.filter((op) => op.value !== '*').map((op) => op.value)
        } else if (isSelectSomeOption(_actionMeta)) {
          result = customOptions.map((item) => item.value)
        }
      }
    }

    setValue(result)
  }

  return (
    <Selects
      icon='fas fa-chevron-down'
      iconAlign='right'
      placeholder={placeholder}
      defaultValue={defaultValue}
      value={value}
      onChange={handleChange}
      options={customOptions}
      isSearchable={isSearchable}
      isMulti={isMulti}
      isClearable={isClearable}
      hideSelectedOptions={hideSelectedOptions}
      closeMenuOnSelect={closeMenuOnSelect}
      isShowCheckbox={isShowCheckbox}
    />
  )
}

export { SelectData }
