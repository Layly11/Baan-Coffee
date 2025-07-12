import styled from 'styled-components'
import React, { JSX } from 'react'

const Section = styled.div`
  width: 100%;
  height: 100%;
  background-color: #fff;
  border-radius: 20px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #e2e9f2;
`

const Title = styled.div`
  ${(props) => `display: ${props.children !== undefined ? 'block' : 'none'};`}
  color: #3B5475;
  background-color: #fafbfd;
  border-bottom: 1px solid #f4f6f9;
`

const Subtitle = styled.div`
  background-color: #fafbfd;
  border-bottom: 1px solid #f4f6f9;
`

const Content = styled.div`
  padding: 20px 30px 20px 30px;
`

const Div = styled.div`
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fafbfd;
  border-bottom: 1px solid #f4f6f9;
  `

const SectionWrapper = ({
  title,
  subtitle,
  children
}: {
  title?: string
  subtitle?: string | React.ReactNode
  children: React.ReactNode
}): JSX.Element => {
  return (
    <Section>
      {title !== '' &&
        <Div>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </Div>}
      <Content>{children}</Content>
    </Section>
  )
}

export default SectionWrapper
