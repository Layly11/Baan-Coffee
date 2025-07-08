import Head from 'next/head'
import { Col, Container, Hidden, Row } from 'react-grid-system'
import React, { FormEvent, JSX, useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { useRouter } from 'next/router'

import title from '../constants/title.json'
import axios from '@/helpers/axios'
import swalInstance, { Alert } from '../helpers/sweetalert'
import Link from 'next/link'


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

const SignupForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
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

const Input = styled.input<{ $hasError?: boolean}>`
  padding: 12px 15px;
  border: 1px solid ${({ $hasError }) => ($hasError ? 'red' : '#ccc')};
  border-radius: 8px;
  font-size: 1em;
  &:focus {
    border-color: #795548;
    outline: none;
    box-shadow: 0 0 0 2px  ${({ $hasError }) =>
        $hasError ? 'red' : 'rgba(121, 85, 72, 0.2)'};
  }
`

const Button = styled.button`
  padding: 12px 25px;
  background-color: #795548;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: #5d4037;
  }
  &:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
  }
`

const ErrorText = styled.span`
  color: red;
  font-size: 0.9em;
  margin-top: 5px;
`

const SignupPage = (): JSX.Element => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      swalInstance.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match!',
      })
      return
    }

    setLoading(true)
    try {
      const res = await axios.post('/api/authen/register', {
        username,
        email,
        password,
      })

      if (res.data?.res_code === '0000') {
        setEmailError(null)
        setUsernameError(null)
        swalInstance.fire({
          icon: 'success',
          title: 'Account Created',
          text: 'Redirecting to login...',
          timer: 1500,
          showConfirmButton: false,
        })
        router.push('/login')
      }
    } catch (err: any) {
      const message = err?.response?.data?.res_code.toLowerCase()
      console.log(message)

      if (message === '0404') {
        setEmailError('Email already exists')
      }
      if (message === '0403') {
        setUsernameError('Username already exists')
      } else {
        swalInstance.fire({
          icon: 'error',
          title: 'Sign Up Failed',
          text: 'Please try again.',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const checkEmailAvailability = async (value: string) => {
    if (!value) return
    try {
      const res = await axios.get('/api/authen/check-availability', { params: { email: value } })
      setEmailError(res.data.checkExist.emailTaken ? 'Email already exist' : null)
    } catch (err: any) {
      Alert({ data: err })
    }
  }

  const checkUsernameAvailability = async (value: string) => {
    if (!value) return
    try {
      const res = await axios.get('/api/authen/check-availability', { params: { username: value } })
      setUsernameError(res.data.checkExist.usernameTaken ? 'Username already exists' : null)
    } catch (err) {
      Alert({ data: err })
    }
  }


  return (
    <>
      <Head>
        <title>{title.SIGNUP_TITLE || 'Sign Up'}</title>
      </Head>
      <Container
        fluid
        style={{
          height: '100vh',
          backgroundImage: 'url(/bg.svg)',
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Row style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Col
            md={6}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 1)',
              minHeight: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <ContainerStyled fluid>
                <Row style={{ margin: '0px -10px 30px -10px' }}>
                  <Col xs={12}>
                    <Title>Sign Up</Title>
                    <Subtitle>Create an account to get started</Subtitle>
                  </Col>
                </Row>
                <SignupForm onSubmit={handleSubmit}>
                  <InputGroup>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      type="username"
                      id="username"
                      name="username"
                      placeholder="Enter your Username"
                      value={username}
                      onChange={(e) => {
                        const value = e.target.value
                        setUsername(value)
                        if (usernameError && value) setUsernameError(null)
                      }}
                      onBlur={(e) => checkUsernameAvailability(e.target.value)}
                      $hasError={!!usernameError}
                      required
                    />
                    {usernameError && <ErrorText>{usernameError}</ErrorText>}
                  </InputGroup>
                  <InputGroup>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        const value = e.target.value
                        setEmail(value)
                        if (usernameError && value) setEmailError(null) 
                      }}
                      onBlur={(e) => checkEmailAvailability(e.target.value)}
                      $hasError={!!emailError}
                      required
                    />
                    {emailError && <ErrorText>{emailError}</ErrorText>}
                  </InputGroup>
                  <InputGroup>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <InputGroup>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </InputGroup>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Signing Up...' : 'Sign Up'}
                  </Button>
                </SignupForm>
                <div style={{ textAlign: 'left', marginTop: '20px' }}>
                  <span style={{ color: '#4e342e' }}>Already have an account? </span>
                  <Link href="/login" style={{ color: '#795548', fontWeight: 'bold', textDecoration: 'underline' }}>
                    Sign In
                  </Link>
                </div>
              </ContainerStyled>
            </div>
          </Col>
          <Hidden xs sm>
            <Col
              md={6}
              style={{
                padding: '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                src="/sign_in.png"
                width={550}
                height={550}
                style={{ width: '80%', height: '70%' }}
                alt="sign up logo"
                loading="eager"
                onContextMenu={(e) => e.preventDefault()}
              />
            </Col>
          </Hidden>
        </Row>
      </Container>
    </>
  )
}

export default SignupPage
