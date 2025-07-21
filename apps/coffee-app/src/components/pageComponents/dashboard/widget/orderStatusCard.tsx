// components/commons/OrderStatusCard.tsx
import styled from "styled-components"
import { ReactNode } from "react"

interface OrderStatusCardProps {
  icon: ReactNode
  label: string
  count: string | number
  badgeText?: string
  badgeColor?: string
  iconBg?: string
}

const Card = styled.div`
  background: #fffaf0; /* coffee-cream */
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  min-width: 220px;
`

const IconCircle = styled.div<{ bg: string }>`
  background-color: ${({ bg }) => bg};
  border-radius: 50%;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  color: #4b3832; /* dark coffee */
`

const Count = styled.span`
  font-size: 1.25rem;
  font-weight: bold;
`

const Badge = styled.span<{ color?: string }>`
  color: ${({ color }) => color || "#c1440e"}; /* coffee red */
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: 0.5rem;
`

export const OrderStatusCard = ({
  icon,
  label,
  count,
  badgeText,
  badgeColor,
  iconBg = "#d6a77a", // light brown
}: OrderStatusCardProps) => {
  return (
    <Card>
      <IconCircle bg={iconBg}>{icon}</IconCircle>
      <Info>
        <span>{label}</span>
        <Count>
          {count}
          {badgeText && <Badge color={badgeColor}>{badgeText}</Badge>}
        </Count>
      </Info>
    </Card>
  )
}
