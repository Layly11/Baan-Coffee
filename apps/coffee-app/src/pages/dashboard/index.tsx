import withAuthenticated from "@/hocs/withAuthenticated"
import { UseSelectorProps } from "@/props/useSelectorProps"
import Head from "next/head"
import { useRouter } from "next/router"
import { useSelector } from "react-redux"
import title from '../../constants/title.json'
import { Col, Container, Row } from 'react-grid-system'
import MainLayout from "@/components/layouts/mainLayout"
import Title from "@/components/commons/title"

const DashBoardPage = () => {
  const user = useSelector((state: UseSelectorProps) => state.user)
  const router = useRouter()
  console.log('user', user)
  return (
    <>
     <Head>
      <title>{title.DASHBOARD_TITLE}</title>
     </Head>
      
     <MainLayout isFetching={user === null}>
      <Container fluid>
        <Row justify='between' style={{ margin: '0px -10px' }}>
             <Col sm={12}>
              <Title>DashBoard</Title>
            </Col>
        </Row>
      </Container>
     </MainLayout>
    </>
  )
}

export default withAuthenticated(DashBoardPage)

