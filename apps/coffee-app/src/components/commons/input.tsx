import React, { JSX, useState } from 'react'
import { useSelector } from 'react-redux'
import styled, { ThemeProvider, css } from 'styled-components'
import type { UseSelectorProps } from '../../props/useSelectorProps'

const Container = styled.div<{ $isinvalid: boolean, $isdisabled: boolean }>`
  display: flex;
  padding: 0px 10px;
  align-items: center;
  width: auto;
  height: 35px;
  background-color: #fafbfd;
  border: 1px solid #e2e9f2;
  border-radius: 10px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;
  > i {
    margin-right: 10px;
    color: #3B5475;
    transition: all 0.2s;
  }
  > input {
    display: block;
    padding: 0px;
    width: 100%;
    height: auto;
    border: none;
    font-size: 0.875em;
    color: #3B5475;
    background: transparent;
    outline: none;
    transition: all 0.2s;
  }
  > input::placeholder {
      color: #3B5475;
  }
  &:focus-within {
    background-color: #fff;
    border: 2px solid #92a3b9;
    > i {
      color: #3B5475;
    }
    > input {
      color: #3B5475;
    }
  }
  ${(props) =>
    props.$isinvalid &&
    css`
      border: 2px solid #ea5455;
      box-shadow: 0px 5px 10px rgba(234, 84, 85, 0.2);
      > i {
        color: #ea5455;
      }
      > input {
        color: #ea5455;
      }
      &:focus-within {
        border: 2px solid #ea5455;
        > i {
          color: #ea5455;
        }
        > input {
          color: #ea5455;
        }
      }
    `}

    ${(props) =>
    props.$isdisabled &&
    css`
       background-color: lightgray;
       border: 1px solid lihtgray;'
       cursor: not-allowed;
      `
  }
`

const Button = styled.button`
  background-color: transparent;
  border: none;

  &:disabled {
    cursor: not-allowed;
    > i {
      color: lightgray; 
    }
  }
`

interface PropsInput extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  value?: string | number | string[]
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  btnRight?: string
  onclickBtnRight?: () => void
}

const Input = (props: PropsInput): JSX.Element => {
  const {
    icon,
    value,
    onChange,
    type,
    btnRight: iconRight,
    onclickBtnRight: onclickIconRight,
    disabled,
    ...rest
  } = props
  const [isInvalid, setIsInvalid] = useState(false)
  return (
      <Container $isinvalid={isInvalid} $isdisabled={disabled ?? false}>
        {(icon != null) && <i className={icon} />}
        <input
          {...rest}
          value={value}
          type={type}
          onChange={onChange}
          onInvalid={() => {
            setIsInvalid(true)
            setTimeout(() => {
            setIsInvalid(false)
            }, 2000)
          }}
          onKeyUp={() => { setIsInvalid(false) }}
          disabled={disabled}
        />
        {(iconRight != null) && (
          <Button onClick={onclickIconRight} type='button'>
            <i className={iconRight} />
          </Button>
        )}
      </Container>
  )
}

export default Input
