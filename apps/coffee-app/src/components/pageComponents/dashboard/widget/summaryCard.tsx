// components/commons/SummaryCard.tsx
import styled from "styled-components"
import { ReactNode } from "react"
import { FaLayerGroup, FaShoppingCart, FaRegCreditCard } from "react-icons/fa" 

interface SummaryCardProps {
  icon: ReactNode
  title: string
  amount: string | number | undefined
  details?: Record<string, string | number> | undefined
  bgColor?: string // เช่น '#0e9488'
  textColor?: string // เช่น '#ffffff'
}

const Card = styled.div<{ bgColor: string }>`
  background-color: ${({ bgColor }) => bgColor};
  border-radius: 12px;
  padding: 1.5rem;
  color: white;
  width: 200px;
  text-align: center;
`

const Amount = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.25rem 0;
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 1rem;
  font-size: 0.9rem;
`

export const SummaryCard = ({
  icon,
  title,
  amount,
  details,
  bgColor = "#A47148", 
  textColor = "#fffaf0"
}: SummaryCardProps) => {

  return (
    <Card bgColor={bgColor} style={{ color: textColor }}>
      {icon}
      <div>{title}</div>
      <Amount>{amount}</Amount>
      {details && (
        <DetailRow>
          {Object.entries(details).map(([key, val]) => (
            <div key={key}>
              {key} : {val}
            </div>
          ))}
        </DetailRow>
      )}
    </Card>
  )
}
