import React ,{JSX} from 'react'
import styled from 'styled-components'
import Label from '../components/commons/label'
import Skeleton from '../components/commons/skeleton'
import userRole from '../constants/masters/userRole.json'

type ValueType = string | number | JSX.Element

interface TColumn {
  $width?: string
  $align?: string
  $color?: string
  $flexDirection?: string
  $alignItems?: string
  $fontSize?: string
  $fontSizeSub?: string
  $justifyContent?: string

}
export const Column = styled.div<TColumn>`
  display: flex;
  flex-direction: ${({ $flexDirection = 'column' }) => $flexDirection};
  align-items: ${({ $alignItems = 'flex-start' }) => $alignItems};
  justify-content: ${({ $justifyContent = 'flex-start' }) => $justifyContent};
  gap: 3px;
  margin-bottom: 10px;
  word-break: break-word;
  text-align: ${({ $align = 'left' }) => $align};
  font-size: ${({ $fontSize = '1em' }) => $fontSize};
  color: ${({ $color = '#3B5475' }) => $color};


  > span:nth-child(2) {
    font-size: ${({ $fontSizeSub = '0.8em' }) => $fontSizeSub};
    color: ${({ $color = '#92a3b9' }) => $color};
  }
`

const Container = styled.div<{ $flexDirectionContainer?: string }>`
  display: flex;
  flex-direction: ${({ $flexDirectionContainer = 'column' }) => $flexDirectionContainer};

  > label {
    flex: 0.6;
  }

  > div {
    flex: 1;
  }
`
export const RenderField = ({
  label,
  subLabel,
  value,
  subvalue,
  subvalueAddress,
  isFetching,
  style = {},
  icon,
  subvalueRight
}: {
  label?: string
  subLabel?: string
  value: ValueType
  subvalue?: ValueType
  subvalueAddress?: ValueType
  isFetching: boolean
  style?: {
    flexDirection?: string
    flexDirectionContainer?: string
    alignItems?: string
    color?: string
    fontSize?: string
    fontSizeSub?: string
    align?: string
    width?: string
    justifyContent?: string
  }
  icon?: JSX.Element
  subvalueRight?: ValueType
}): JSX.Element => {
  const {
    flexDirection,
    alignItems,
    color,
    fontSize,
    fontSizeSub,
    align,
    width,
    justifyContent
  } = style

  const isLabel = label !== undefined && label !== '' && label !== null
  const isSubLabel = subLabel !== undefined && subLabel !== '' && subLabel !== null
  const isSubvalue = subvalue !== undefined && subvalue !== '' && subvalue !== null
  const isValue = value !== undefined && value !== '' && value !== null

  return (
    <Container $flexDirectionContainer={style.flexDirectionContainer}>
      <div>
        {
          isLabel && (
            <Label>
              {label}
              {icon}
            </Label>
          )
        }
        {
          isSubLabel && (
            <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
              <Label style={{ lineHeight: 0.1 }}>{subLabel}</Label>
              {typeof subvalueAddress !== 'undefined' && subvalueAddress !== null && subvalueAddress !== '' && (
                <span style={{ fontSize: fontSizeSub, color, marginLeft: '8px' }}>
                  {isFetching ? <Skeleton style={{ width: '10vw' }} /> : subvalueAddress}
                </span>
              )}
            </div>)
        }
      </div>

      <Column
        $flexDirection={flexDirection}
        $alignItems={alignItems}
        $color={color}
        $fontSize={fontSize}
        $fontSizeSub={fontSizeSub}
        $align={align}
        $width={width}
        $justifyContent={justifyContent}
      >
        <span>
          {isFetching ?? <Skeleton style={{ width: '10vw' }} />}
          {!isFetching && (isValue ? value : '-')}
          {isFetching
            ? <Skeleton style={{ width: '10vw' }} />
            : subvalueRight}
        </span>

        {isSubvalue && (
          <span>
            {isFetching
              ? <Skeleton style={{ width: '10vw' }} />
              : (subvalue)}
          </span>
        )}
      </Column>
    </Container>
  )
}

type TDetail = Record<string, string | number | boolean | null>
const getRoleName = (roleId: string): string => {
  const role = Object.values(userRole).find(
    (role) => role.id === Number(roleId)
  )
  return role !== undefined ? role.label : 'Unknown Role'
}

const renderValue = (
  value: any,
  keyRole: boolean = false
): JSX.Element | string => {
  if (typeof value === 'object' && value !== null) {
    return (
      <div>
        {Object.keys(value as Record<string, any>).map((subKey) => (
          <div key={subKey}>
            {subKey} :{' '}
            {keyRole
              ? getRoleName(value[subKey] as string)
              : renderValue(value[subKey])}
          </div>
        ))}
      </div>
    )
  }
  return value.toString()
}

export const renderDetail = (detail: string): JSX.Element => {
  if (detail === null || detail === undefined || detail === '') {
    return <div>-</div>
  }

  let parsedDetail: TDetail
  try {
    parsedDetail = JSON.parse(detail)
  } catch (e) {
    console.error('Failed to parse detail JSON', e)
    return <div>Invalid detail format</div>
  }

  return (
    <div>
      {Object.keys(parsedDetail).map((key) => (
        <div key={key} className='flex flex-row align-center'>
          <div>
            <span>{key === 'role_id' ? 'Role' : key}</span>
            <span className='ml-5'>
              {renderValue(parsedDetail[key], key === 'role_id')}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
