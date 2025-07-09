import { UseSelectorProps } from "@/props/useSelectorProps";
import { useRouter } from "next/router";
import { JSX, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from '../../helpers/sweetalert'
import axios, { setAccessToken } from '../../helpers/axios'
import styled, { ThemeProvider, keyframes } from 'styled-components'
import { Hidden } from 'react-grid-system'

import UserRole from '../../constants/masters/userRole.json'
import { DateFormat, TimeFormat } from "../formats/datetime";

const AnimatedLogoContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const AnimatedLogoKeyframe = keyframes`
  0% {
    opacity:1;
    transform:  scaleX(1) scaleY(1);
  }
  50% {
    opacity:0.7;
    transform:  scaleX(1.2) scaleY(1.2);
  }
  100% {
    opacity:1;
    transform:  scaleX(1) scaleY(1);
  }
`

const AnimatedLogo = styled.img`
  display: block;
  width: 100px;
  height: 100px;
  animation: ${AnimatedLogoKeyframe} ease-in-out 2s infinite;
`

const ProfileName = styled.div`
  font-size: 0.7em;
  line-height: 1.1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  > span:nth-of-type(2) {
    font-size: 0.6em;
    color: #636363;
  }
  > span:nth-of-type(3) {
    font-size: 0.8em;
    color: #979797;
  }
`

const Container = styled.div`
  display: grid;
  grid-template-rows: 1fr 40px;
  grid-template-columns: 230px 1fr;
  background-color: rgba(255, 255, 255, 1);

  @media (max-width: 1024px) {
    grid-template-columns: 15vw 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 15vw 1fr;
  }

  @media (max-width: 480px) {
    grid-template-columns: 20vw 1fr;
  }
`
const Sidebar = styled.div`
  position: fixed;
  width: 250px;
  display: flex;
  flex-direction: column;
  padding: 10px 20px 20px 20px;
  grid-row: 1 / 3;
  grid-column: 1 / 2;
  height: 100%;
  background: linear-gradient(to top, #DECEF8, #FDD7D9);
  background-size: cover;
  box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.01);
  box-sizing: border-box;

  @media (max-width: 1024px) {
    width: 15vw;
  }

  @media (max-width: 768px) {
    width: 15vw;
  }

  @media (max-width: 480px) {
    width: 20vw;
  }
`

export default function MainLayout({ isFetching, children }: { isFetching: boolean, children?: React.ReactNode }): JSX.Element {
  const dispatch = useDispatch()
  const user = useSelector((state: UseSelectorProps) => state.user)
  const router = useRouter()

  const handleOnClicklogout = async (): Promise<void> => {
    const { isConfirmed } = await Swal.fire({
      title: 'Log Out?',
      text: 'Are you sure you want to log out?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      heightAuto: false,
      imageUrl: '/logout.svg',
      imageHeight: 110,
      imageWidth: 110
    })
    if (!isConfirmed) return

    try {
      dispatch({ type: 'SET_USER_TOKEN', payload: null })
      dispatch({ type: 'SET_USER', payload: null })
      setAccessToken('')
      const res = await axios.post('/api/authen/logout')
      if (res.status === 200) {
        localStorage.clear()
        await router.push('/login')
      }
    } catch (err) {
      console.error(err)
      Swal.fire({
        icon: 'error',
        title: 'Logout Failed',
        text: 'Unable to logout, please try again.'
      })
    }
  }

  if(isFetching) {
     return (
        <AnimatedLogoContainer>
          <AnimatedLogo
            src='/coffee-cup.png'
            draggable={false}
            onContextMenu={(e) => { e.preventDefault() }}
          />
        </AnimatedLogoContainer>
      )
  }

  const profileName = useMemo(
    () => (
      <ProfileName>
        <span>
          {(user !== null || user !== undefined) && `${user?.username}`}
        </span>
        <br />
        <span>
          {(user !== null || user !== undefined) && UserRole[user?.role as keyof typeof UserRole]?.label}
        </span>
        <br />
        <span>{DateFormat(user?.last_login)} {TimeFormat(user?.last_login)}</span>
      </ProfileName>
    ),
    [user]
  )



  return (
    <Container className="container">
      <Sidebar>

      </Sidebar>
    </Container>

  )
}