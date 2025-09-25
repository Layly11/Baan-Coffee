import withAuthenticated from "@/hocs/withAuthenticated"
import Head from "next/head"
import title from '../../constants/title.json'
import MainLayout from "@/components/layouts/mainLayout"
import { UseSelectorProps } from "@/props/useSelectorProps"
import { useSelector } from "react-redux"
import { Col, Container, Row } from "react-grid-system"
import Title from "@/components/commons/title"
import Table from "@/components/commons/table"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { Columns } from "@/components/pageComponents/customersOrder/column"
import { Alert } from "@/helpers/sweetalert"
import { fetchCustomerOrderRequester } from "@/utils/requestUtils"
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'

const CustomersPage = () => {
    const user = useSelector((state: UseSelectorProps) => state.user)
    const router = useRouter()

    const id = router.query.id as string
    const pathname = `/customers/${id}`
    const [isFetching, setIsFetching] = useState(false)
    const [isSearch, setIsSearch] = useState(false)
    const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
    const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
    const [total, setTotal] = useState(0)
    const [rows, setRows] = useState<any>([])

      const canEditOrder = user?.permissions.some(
        (permission) =>
          permission.name === PermissionMenuMaster.ORDER_MANAGEMENT &&
          permission.edit
      )

    const fetchCustomerOrder = async () => {
        try {
             const config = {
                    params: {
                      limit: (pageSize),
                      offset: (pageSize * (page ?? 0))
                    }
                  }
            const res = await fetchCustomerOrderRequester(id, config)

            if(res.data !== null) {
             const orders = res.data.orders
            const total = res.data.total
                console.log("Data: ", orders)
            setRows(orders)
            setTotal(total)
            }
        } catch (err) {
            console.error(err)
            Alert({data: err})
        }
    }

    useEffect(() => {
        if(id) {
             fetchCustomerOrder()
        }
    },[id])
    const handleOnChangePage = async (page: number): Promise<void> => {
        setPage(page)
        router.replace({
            pathname,
            query: { ...router.query, page }
        })
        // await fetchCustomerData()
    }

    return (
        <>
            <Head>
                <title>{title.CUSTOMER_TITLE}</title>
            </Head>

            <MainLayout isFetching={user === null} >
                <Container fluid>
                    <Row justify='between' style={{ margin: '0px -10px' }}>
                        <Col sm={12}>
                            <Title>Customers Order List</Title>
                        </Col>
                    </Row>

                    <Row style={{ margin: '20px -10px 0px -10px' }}>
                        <Col xs={12}>
                            <Table
                                isFetching={isFetching}
                                total={total}
                                pageSize={pageSize}
                                setPageSize={setPageSize}
                                setPage={handleOnChangePage}
                                page={page}
                                columns={Columns(setRows,canEditOrder)}
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