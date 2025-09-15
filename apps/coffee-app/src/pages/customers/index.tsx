import withAuthenticated from "@/hocs/withAuthenticated"
import Head from "next/head"
import title from '../../constants/title.json'
import MainLayout from "@/components/layouts/mainLayout"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useRouter } from "next/router"
import { UseSelectorProps } from "@/props/useSelectorProps"
import { Col, Container, Row } from "react-grid-system"
import Title from "@/components/commons/title"
import { Header } from "@/components/pageComponents/customers/header"
import Table from "@/components/commons/table"
import { Columns } from "@/components/pageComponents/customers/column"
import { Alert } from "@/helpers/sweetalert"
import { fetchCustomerDataRequester } from "@/utils/requestUtils"
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'
import PermissionActionMaster from '../../constants/masters/PermissionActionMaster.json'
import { checkPermission } from "@/helpers/checkPermission"
const pathname = '/customers'

const CustomersPage = () => {
    const user = useSelector((state: UseSelectorProps) => state.user)
    const router = useRouter()
    const [isFetching, setIsFetching] = useState(false)
    const [isSearch, setIsSearch] = useState(true)
    const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
    const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
    const [total, setTotal] = useState(0)
    const [rows, setRows] = useState<any>([])
    const [information, setInformation] =  useState(router.query.information ?? '')

    const fetchCustomerData = async (page?: any) => {
        setIsFetching(true)
        setIsSearch(false)
        try {
             const config = {
                    params: {
                      information,
                      limit: (pageSize),
                      offset: (pageSize * (page ?? 0))
                    }
                  }
            const res = await fetchCustomerDataRequester(config)

            console.log("res: ",res.data)
            if(res.data !== null) {
                const customers = res.data.customers
                const total = res.data.total

                setRows(customers)
                setTotal(total)
            }
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        fetchCustomerData()
    },[])

    const handleOnClearSearch = async () => {
        setRows([])
        setTotal(0)
        setPage(0)
        setInformation('')
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
                information
            }
        })
         await fetchCustomerData()
    }

    const handleOnChangePage = async (page: number): Promise<void> => {
        setPage(page)
        router.replace({
            pathname,
            query: { ...router.query, page }
        })
       await fetchCustomerData()
    }


    useEffect(() => {
        const page = PermissionMenuMaster.MANAGE_CUSTOMER
        const action = PermissionActionMaster.VIEW
        checkPermission({ user, page, action }, router)
    }, [user])


    return (
        <>
            <Head>
                <title>{title.ORDERS_TITLE}</title>
            </Head>

            <MainLayout isFetching={user === null} >
                <Container fluid>
                    <Row justify='between' style={{ margin: '0px -10px' }}>
                        <Col sm={12}>
                            <Title>Customers</Title>
                        </Col>
                    </Row>

                    <Header
                        information={information}
                        setInformation={setInformation}
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

export default withAuthenticated(CustomersPage)