import Head from 'next/head'
import { Col, Container, Hidden, Row } from 'react-grid-system'
import React, { JSX, useEffect } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { useRouter } from 'next/router'


import title from '../constants/title.json'
import axios from 'axios'
import { redirectToDefaultPage } from '../utils/redirectUtils'


const Title = styled.div`
  font-size: 3em;
  font-weight: bold;
  color: #4e342e;
`

const Subtitle = styled.div`
  color: #4e342e;
  font-weight: 400;
`
const ContainerStyled = styled(Container)`
  width: 35vw;

  @media (max-width: 768px) {
    width: 80vw;
  }
`

const LoginPage = (): JSX.Element => {
  const router = useRouter()

  useEffect(() => {
    axios.get('/api/authen/profile')
      .then((res) => {
        redirectToDefaultPage(res.data?.user?.permissions as Array<{ name: string, view: boolean }> | undefined, router)
      })
      .catch(() => {})
  }, [router])

  return (
    <>
      <Head>
        <title>{title.LOGIN_TITLE}</title>
      </Head>
      <Container
        fluid
        style={{
          height: '100%',
          backgroundImage: 'url(/bg.svg)',
          backgroundSize: 'cover'
        }}
      >
        <Row style={{ height: '100%' }}>
          <Col
            md={6}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 1)'
            }}
          >
            <ContainerStyled fluid>
              <Row style={{ margin: '0px -10px 30px -10px' }}>
                <Col xs={12}>
                  <Title>Sign In</Title>
                  <Subtitle>
                    Welcome, Please sign in with your username and password
                  </Subtitle>
                </Col>
              </Row>
            </ContainerStyled>
            <Row
              style={{
                position: 'absolute',
                bottom: '10px'
              }}
            />

          </Col>
          <Hidden xs sm>
            <Col
              md={6}
              style={{
                padding: '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Image
                src='/sign_in.png'
                width={550}
                height={550}
                style={{ width: '80%', height: '70%' }}
                alt='sign in logo'
                loading='eager'
                onContextMenu={(e) => { e.preventDefault() }}
              />
            </Col>
          </Hidden>
        </Row>
      </Container>
    </>
  )
}

export default LoginPage
