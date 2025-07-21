import Head from "next/head"
import title from '../../constants/title.json'
import MainLayout from "@/components/layouts/mainLayout"
import { useDebugValue, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { UseSelectorProps } from "@/props/useSelectorProps"
import { Col, Container, Row } from "react-grid-system"
import Title from "@/components/commons/title"
import withAuthenticated from "@/hocs/withAuthenticated"
import Detail from "@/components/pageComponents/dashboard/detail/detail"
import { useRouter } from "next/router"
import { fetchDashboardDetailRequester } from '../../utils/requestUtils'
import { Alert } from "@/helpers/sweetalert"
import DetailsTable from "@/components/pageComponents/dashboard/detail/detailTable"

const DashBoardPage = () => {
    const router = useRouter()
    const user = useSelector((state: UseSelectorProps) => state.user)
    const [isFetching, setIsFetching] = useState(true)
    const [dashboardInfo, setDashboardInfo] = useState<any>({})
    const id = router.query.id as string

    const handleFetchDashboardDetail = async () => {
        try {
            const response = await fetchDashboardDetailRequester(id)
            console.log('Detail: ', response.data.detail)
            console.log('Inventory Detail: ', dashboardInfo.inventory_statuses)
            setDashboardInfo(response.data.detail)
        } catch (err) {
            console.error(err)
            Alert({
                data: err
            })
            router.push('/dashboard')
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        if (id !== undefined) {
            handleFetchDashboardDetail()
        }
    }, [id])

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
                    <Row style={{ margin: '10px -10px 0px -40px' }}>
                        <Detail dashboardInfo={dashboardInfo} isFetching={isFetching} mode={'summary'} />
                    </Row>
                    <Row style={{ margin: '10px -10px 0px -40px' }}>
                        <DetailsTable detailInfo={dashboardInfo.inventory_statuses} title={'Inventory Status'} type={'inventory'} />
                    </Row>
                    <Row style={{ margin: '10px -10px 0px -40px' }}>
                        <DetailsTable detailInfo={dashboardInfo.shifts} title={'Shift Panel'} type={'shift'} />
                    </Row>
                    <Row style={{ margin: '10px -10px 0px -40px' }}>
                        <DetailsTable detailInfo={dashboardInfo.top_products} title={'Top Product'} type={'top_products'} />
                    </Row>
                </Container>
            </MainLayout>
        </>

    )
}

export default withAuthenticated(DashBoardPage)