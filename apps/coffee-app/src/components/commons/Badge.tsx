import styled from 'styled-components'

interface BadgeProps {
  $width?: string
  $color: string
  $backgroundcolor?: string
  $fontSize?: string
}

const Badge = styled.div<BadgeProps>`
  padding: 0px 8px;
  line-height: 2em;
  font-size: ${(props) => props.$fontSize ?? '0.875em;'};
  text-align: center;
  border-radius: 20px;
  ${(props) => `
      width: ${
        props.$width != null && props.$width !== '' ? props.$width : 'auto'
      };
      color: ${props.$color};
      background-color: ${props.$backgroundcolor};
    `}
`

export default Badge
