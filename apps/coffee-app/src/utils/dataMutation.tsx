import React from 'react'

interface DataMutationProps {
  value: string
  transform?: (name: string) => string
  defaultValue?: string
  style?: React.CSSProperties
  component?: React.ReactNode
}

const DataMutation: React.FC<DataMutationProps> = ({
  value,
  transform = (name) => name,
  defaultValue = '-',
  style = {},
  component
}) => {
  const content = component ?? (value !== undefined || value !== null
    ? transform(value)
    : defaultValue)

  return <div style={style}>{content}</div>
}

export default DataMutation
