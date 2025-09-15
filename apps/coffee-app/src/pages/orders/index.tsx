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
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'
import PermissionActionMaster from '../../constants/masters/PermissionActionMaster.json'
import { checkPermission } from "@/helpers/checkPermission"
import { checkNullUndefiendEmptyString, checkRouterQueryAndAutoFetchData, parseToArrayAndRemoveSelectAllValue } from "@/utils/parseUtils"

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
    const [isSearch, setIsSearch] = useState(true)
    const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
    const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
    const [total, setTotal] = useState(0)
    const [rows, setRows] = useState<any>([])
    const [status, setStatus] = useState(router.query.status ?? '')
    const [method, setMethod] = useState(router.query.method ?? '')
    const [customerName, setCustomerName] = useState(router.query.customerName ?? '')


    const fetchOrderData = async (page?: any) => {
        setIsFetching(true)
        console.log("Page:",page)
        try {
            const config = {
                params: {
                    start_date: dayjs(startDate).format('YYYY-MM-DD'),
                    end_date: dayjs(endDate).format('YYYY-MM-DD'),
                    status: parseToArrayAndRemoveSelectAllValue(checkNullUndefiendEmptyString(status)),
                    method: parseToArrayAndRemoveSelectAllValue(checkNullUndefiendEmptyString(method)),
                    customer_name: parseToArrayAndRemoveSelectAllValue(checkNullUndefiendEmptyString(customerName)),
                    limit: (pageSize),
                    offset: (pageSize * (page ?? 0))
                }
            }
            const res = await fetchOrderRequester(config)
            const orders = res.data.orders
            const total = res.data.total

            console.log("total: ",total)
            setRows(orders)
            setTotal(total)

        } catch (err) {
            console.error(err)
            Alert({ data: err })
        } finally {
            setIsFetching(false)
        }
    }


    const handleOnClearSearch = async () => {
        setStartDate(dayjs().endOf('day').subtract(30, 'day').startOf('day').toDate())
        setEndDate(dayjs().toDate())
        setRows([])
        setTotal(0)
        setStatus('')
        setMethod('')
        setCustomerName('')
        setIsSearch(true)
        router.push({
            pathname,
            query: {}
        })
    }

    const handleOnClickSearch = async () => {
        setIsSearch(false)
        setPage(0)
        router.push({
            pathname,
            query: {
                startDate: dayjs(startDate).format('YYYY-MM-DD'),
                endDate: dayjs(endDate).format('YYYY-MM-DD'),
                status,
                method,
                customerName,
                limit: pageSize
            }
        })
        await fetchOrderData(page)
    }

    const handleOnChangePage = async (page: number): Promise<void> => {
        setPage(page)
        router.replace({
            pathname,
            query: { ...router.query, page }
        })

        await fetchOrderData(page)

    }


    useEffect(() => {
    if (!router.isReady) return

    const defaultEnd = dayjs().endOf('day')
    const defaultStart = defaultEnd.subtract(30, 'day').startOf('day')
    if (router.query.startDate && dayjs(router.query.startDate as string).isValid()) {
      setStartDate(dayjs(router.query.startDate as string).toDate())
    } else {
      setStartDate(defaultStart.toDate())
    }


    if (router.query.endDate && dayjs(router.query.endDate as string).isValid()) {
      setEndDate(dayjs(router.query.endDate as string).toDate())
    } else {
      setEndDate(defaultEnd.toDate())
    }

    if (typeof router.query.page === 'string' && !isNaN(Number(router.query.page))) {
      setPage(Number(router.query.page))
    }
    if (typeof router.query.limit === 'string' && !isNaN(Number(router.query.limit))) {
      setPageSize(Number(router.query.limit))
    }
  }, [router.isReady, router.query])

    useEffect(() => {
        const page = PermissionMenuMaster.ORDER_MANAGEMENT
        const action = PermissionActionMaster.VIEW
        checkPermission({ user, page, action }, router)
    }, [user])


    useEffect(() => {
        checkRouterQueryAndAutoFetchData({
            query: router.query,
            fetchData: fetchOrderData
        })
    }, [])


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
                        status={status}
                        setStatus={setStatus}
                        method={method}
                        setMethod={setMethod}
                        customerName={customerName}
                        setCustomerName={setCustomerName}
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
                                columns={Columns(setRows)}
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