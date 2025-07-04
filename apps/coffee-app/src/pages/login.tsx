import Head from 'next/head'
import { Col, Container, Hidden, Row } from 'react-grid-system'
import React, { FormEvent, JSX, useEffect, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { useRouter } from 'next/router'


import title from '../constants/title.json'
import axios from '@/helpers/axios'
import { redirectToDefaultPage } from '../utils/redirectUtils'
import swalInstance, { Alert } from '../helpers/sweetalert'
import { setAccessToken } from '@/helpers/axios'
import { useDispatch } from 'react-redux'

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
const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px; /* ระยะห่างระหว่างฟอร์มคอนโทรล */
  margin-top: 30px;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const Label = styled.label`
  margin-bottom: 8px;
  font-weight: 500;
  color: #4e342e;
`

const Input = styled.input`
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  &:focus {
    border-color: #795548; /* สีขอบเมื่อ focus */
    outline: none;
    box-shadow: 0 0 0 2px rgba(121, 85, 72, 0.2);
  }
`

const Button = styled.button`
  padding: 12px 25px;
  background-color: #795548; /* สีปุ่ม */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #5d4037; /* สีเข้มขึ้นเมื่อ hover */
  }
  &:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
  }
`


const LoginPage = (): JSX.Element => {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false); 
  const dispatch = useDispatch()

  useEffect(() => {
    axios.get('/api/authen/profile')
      .then((res) => {
        redirectToDefaultPage(res.data?.user?.permissions as Array<{ name: string, view: boolean }> | undefined, router)
      })
      .catch(() => {})
  }, [router])


    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setLoading(true);
    try{
      const res = await axios.post('/api/authen/login/',{ email, password})
      
      if(res.data?.res_code === '0000') {
         console.log('Login successful');
         const token = res.data.data.accessToken
         setAccessToken(token)
         dispatch({ type: 'SET_USER_TOKEN', payload: token })
         const profileRes = await axios.get('/api/authen/profile');
         if(profileRes.data.user){
          redirectToDefaultPage(profileRes.data?.user?.permissions as Array<{ name: string, view: boolean }> | undefined, router)
         } else {
           swalInstance.fire({
                icon: 'success',
                title: 'Login Success',
                text: 'Redirecting...',
                timer: 1500,
                showConfirmButton: false
            });
         }
      }
    } catch (error) {
       console.error('Login failed:', error);
       Alert(error as any)
    } finally {
      setLoading(false)
    }
  }

  return (
      <>
      <Head>
        <title>{title.LOGIN_TITLE}</title>
      </Head>
      <Container
        fluid
        style={{
          height: '100vh',
          backgroundImage: 'url(/bg.svg)',
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Row style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Col
            md={6}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // จัดกึ่งกลางเนื้อหาใน Col
              backgroundColor: 'rgba(255, 255, 255, 1)',
              minHeight: '100%' // ให้ Col นี้สูงเต็มพื้นที่
            }}
          >
            {/* Wrapper เพื่อจัดกึ่งกลาง ContainerStyled ใน Col */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <ContainerStyled fluid>
                <Row style={{ margin: '0px -10px 30px -10px' }}>
                  <Col xs={12}>
                    <Title>Sign In</Title>
                    <Subtitle>
                      Welcome, Please sign in with your username and password
                    </Subtitle>
                  </Col>
                </Row>
                {/* Form สำหรับ Login */}
                <LoginForm onSubmit={handleSubmit}>
                  <InputGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={handleEmailChange}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                    />
                  </InputGroup>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </LoginForm>
              </ContainerStyled>
              {/* คุณสามารถเพิ่มส่วนอื่นๆ เช่น ลืมรหัสผ่าน, สมัครสมาชิก ที่นี่ได้ */}
            </div>
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
