import Head from "next/head"
import title from '../../constants/title.json'
import MainLayout from "@/components/layouts/mainLayout"
import { useState } from "react"
import { useSelector } from "react-redux"
import { UseSelectorProps } from "@/props/useSelectorProps"
import { Col, Container, Row } from "react-grid-system"
import Title from "@/components/commons/title"
import withAuthenticated from "@/hocs/withAuthenticated"
import Detail from "@/components/pageComponents/dashboard/detail/detail"
import { useRouter } from "next/router"

const DashBoardPage = () => {
    const router = useRouter()
    const user = useSelector((state: UseSelectorProps) => state.user)
    const [isFetching, setIsFetching] = useState(true)
    const id = router.query.id as string

    const fetchDashboardDetail = async () => {
        setIsFetching(false)
        try {
            
        }catch (err) {

        }
    }
    return (
        <>
            <Head>
                <title>{title.DASHBOARD_TITLE}</title>
            </Head>
            <MainLayout isFetching={user === null}>
                <Container fluid>
                    <Row>
                        <Col>
                            <Title>Sales Summary</Title>
                        </Col>
                    </Row>
                    <Row style={{ margin: '10px -10px 0px -10px' }}>
                        {/* <Detail  dashboardInfo={}/> */}
                    </Row>
                </Container>
            </MainLayout>
        </>

    )
}

export default withAuthenticated(DashBoardPage)