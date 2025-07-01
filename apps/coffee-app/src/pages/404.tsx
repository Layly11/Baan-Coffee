import React, { JSX } from 'react'
import ButtonWrapper from '../components/commons/button'
import { useRouter } from 'next/router'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 30%;
  margin: 0 auto;
`

const NotFound = (): JSX.Element => {
  const router = useRouter()
  return (
    <Container>
      <h1>404 - Page Not Found</h1>
      <ButtonWrapper
        $primary
        onClick={() => {
          router.push('/')
        }}
      >
        <i className='fas fa-home' /> Go Home
      </ButtonWrapper>
    </Container>
  )
}

export default NotFound
