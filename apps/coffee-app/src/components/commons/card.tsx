// components/ui/card.tsx
import { ReactNode } from "react"
import clsx from "clsx"
import styled from "styled-components"
interface CardProps {
  children: ReactNode
  className?: string,
   style?: React.CSSProperties
}


export const CardWrapper = styled.div`
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
`

export const CardContentWrapper = styled.div<{ className?: string }>`
  padding: 1rem;
`

export const Card = ({ children, className }: CardProps) => {
  return (
    <CardWrapper
    >
      {children}
    </CardWrapper>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export const CardContent = ({ children, className }: CardContentProps) => {
  return <CardContentWrapper className={clsx("p-4", className)}>{children}</CardContentWrapper>
}


