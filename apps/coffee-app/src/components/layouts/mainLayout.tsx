import { UseSelectorProps } from "@/props/useSelectorProps";
import { useRouter } from "next/router";
import { JSX, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from '../../helpers/sweetalert'
import axios, { setAccessToken } from '../../helpers/axios'
import styled, { keyframes } from 'styled-components'
import { Hidden } from 'react-grid-system'
import Tooltip from 'rc-tooltip'
import UserRole from '../../constants/masters/userRole.json'
import { DateFormat, TimeFormat } from "../formats/datetime";
import Menu from "./menu";

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
  padding: 20px;
  grid-row: 1 / 3;
  grid-column: 1 / 2;
  height: 100%;
  background: linear-gradient(to top, #D7CCC8, #FFF3E0); /* brown-cream gradient */
  background-size: cover;
  box-shadow: 2px 0px 8px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  font-family: 'Playfair Display', serif;

  @media (max-width: 1024px) {
    width: 15vw;
  }
`

const Logo = styled.img`
  display: block;
  margin: -100px auto -80px -50px;
  max-width: 150%;
  height: auto;
  box-sizing: border-box;

  @media (max-width: 1024px) {
    width: 100px;
    margin: 20px auto;
  }
`


const ProfileContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  align-items: center;
  padding: 15px 20px 15px 20px;
  color: #000000;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.69);
  border-radius: 15px;
  @media (max-width: 1024px) {
    background-color: transparent;
    padding: 0px 0px 10px 10px;
  }
`
const Profile = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background-color: #e4ebf3;
  background-image: url('/profile.svg');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  border-radius: 40px;
  box-sizing: border-box;
`


const Logout = styled.button`
  appearance: none;
  display: flex;
  align-items: center;
  font-size: 0.8em;
  padding: 0px 30px;
  height: 40px;
  color: #5e4630;
  border-radius: 10px;
  background-color: transparent;
  border: none;
  outline: none;
  gap: 15px;
  &:hover {
    cursor: pointer;
    color: #5e4630;
    background-color: #f3e4d5;
  }
  img {
    margin: 5px 15px 0px 5px;
    width: 15px;
    height: 15px;
  }

  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    gap: 0px;
    span {
      font-size: 0.5em;
    }
    img {
      width: 15px;
      height: 15px;
      margin: 0 auto;
    }
  }
`

const Content = styled.div`
  padding: 60px 80px 40px 80px;  
  grid-row: 1 / 2;
  grid-column: 2 / 3;

  @media (max-width: 1024px) {
    font-size: 0.7em;
    padding: 40px;
  }

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 10px;
  }
`


export default function MainLayout({ isFetching, children }: { isFetching: boolean, children?: React.ReactNode }): JSX.Element {
  const dispatch = useDispatch()
  const user = useSelector((state: UseSelectorProps) => state.user)
  const router = useRouter()

  const handleOnClickLogout = async (): Promise<void> => {
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
      if (res.data.res_code === '0000') {
        router.push('/login')
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

  useEffect(() => {
    console.log("User Recent Login: ",user)
  },[user])
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
        <span>{DateFormat(user?.recent_login)} {TimeFormat(user?.recent_login)}</span>
      </ProfileName>
    ),
    [user]
  )

  if (isFetching) {
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


  return (
    <Container className="container">
      <Sidebar>
        <Logo
          src='/sign_in.png'
          draggable={false}
          onContextMenu={(e) => { e.preventDefault() }}
        />

        <ProfileContainer>
          <Hidden xs sm md>
            <Profile />
            {profileName}
          </Hidden>
          <Hidden lg xl xxl>
            <Tooltip
              placement='right'
              trigger={['hover']}
              overlay={profileName}
            >
              <Profile />
            </Tooltip>
          </Hidden>
        </ProfileContainer>

        <Menu user={user} />

        <Logout aria-label='Logout' onClick={handleOnClickLogout as any}>
          <Hidden xs>
            <span>
              <img src='/logout_menu.svg' />
            </span>
            <span>
              Logout
            </span>
          </Hidden>
          <Hidden sm md lg xl xxl xxxl>
            <Tooltip placement='right' trigger={['hover']} overlay='Logout'>
              <i className='fas fa-sign-out-alt' />
            </Tooltip>
          </Hidden>
        </Logout>
      </Sidebar>
       <Content>{children}</Content>
    </Container>

  )
}