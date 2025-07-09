import { useSelector } from 'react-redux'
import { styled, keyframes } from 'styled-components'
import { type UseSelectorProps } from '../props/useSelectorProps'
import { useRouter } from 'next/router'
import { JSX, useEffect, useState } from 'react'
import { redirectToDefaultPage } from '@/utils/redirectUtils'
import MainLayout from '@/components/layouts/mainLayout'
import withAuthenticated from '@/hocs/withAuthenticated'

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

const HomePage = (): JSX.Element => {
  const user = useSelector((state: UseSelectorProps) => state.user)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user !== null) {
      setIsLoading(false)
      redirectToDefaultPage(user.permissions, router)
    }
  }, [user, router])

  if (isLoading) {
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
  return <MainLayout isFetching={isLoading}/>
}

export default withAuthenticated(HomePage)
