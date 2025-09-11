import Head from "next/head"
import title from '../../constants/title.json'
import MainLayout from "@/components/layouts/mainLayout"
import { useSelector } from "react-redux"
import { UseSelectorProps } from "@/props/useSelectorProps"
import withAuthenticated from "@/hocs/withAuthenticated"
import { Col, Container, Row } from "react-grid-system"
import Title from "@/components/commons/title"
import { Header } from "@/components/pageComponents/orders/header"
import Table from "@/components/commons/table"
import { useEffect, useState } from "react"
import { Columns } from "@/components/pageComponents/orders/column"
import { useRouter } from "next/router"
import { dayjs } from '../../helpers/dayjs'
import { Alert } from "@/helpers/sweetalert"
import { fetchOrderRequester } from "@/utils/requestUtils"

const pathname = '/orders'

const OrdersPage = () => {
    const user = useSelector((state: UseSelectorProps) => state.user)
    const router = useRouter()

    const [startDate, setStartDate] = useState<Date | null>(
        router.query.startDate != undefined
            ? dayjs(router.query.startDate as string).toDate()
            : dayjs().endOf('day').subtract(30, 'day').startOf('day').toDate()
    )

    const [endDate, setEndDate] = useState<Date | null>(
        router.query.endDate !== undefined
            ? dayjs(router.query.endDate as string).toDate()
            : dayjs().toDate()
    )

    const [isFetching, setIsFetching] = useState(false)
    const [isSearch, setIsSearch] = useState(false)
    const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
    const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
    const [total, setTotal] = useState(0)
    const [rows, setRows] = useState<any>([])


    const fetchOrderData = async () => {
        setIsFetching(true)
        try {
            const res = await fetchOrderRequester() 
            const orders = res.data.orders
            setRows(orders)
            setTotal(orders.length)
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        fetchOrderData()
    },[])

    const handleOnClearSearch = () => {

    }

    const handleOnClickSearch = async () => {

    }

    const handleOnChangePage = async (page: number): Promise<void> => {
        setPage(page)
        router.replace({
            pathname,
            query: { ...router.query, page }
        })

        // fetchProducts(page)
    }



    return (
        <>
            <Head>
                <title>{title.ORDERS_TITLE}</title>
            </Head>

            <MainLayout isFetching={user === null} >
                <Container fluid>
                    <Row justify='between' style={{ margin: '0px -10px' }}>
                        <Col sm={12}>
                            <Title>Orders</Title>
                        </Col>
                    </Row>
                    <Header
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        handleOnClearSearch={handleOnClearSearch}
                        handleOnClickSearch={handleOnClickSearch}
                    />

                    <Row style={{ margin: '20px -10px 0px -10px' }}>
                        <Col xs={12}>
                            <Table
                                isFetching={isFetching}
                                total={total}
                                pageSize={pageSize}
                                setPageSize={setPageSize}
                                setPage={handleOnChangePage}
                                page={page}
                                columns={Columns()}
                                rows={rows}
                                isSearch={isSearch}
                            />
                        </Col>
                    </Row>
                </Container>
            </MainLayout>
        </>
    )
}

export default withAuthenticated(OrdersPage)