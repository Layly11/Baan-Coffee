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
import swalInstance, { Alert } from "@/helpers/sweetalert"
import { deleteCustomerRequester, fetchCustomerDataRequester } from "@/utils/requestUtils"
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'
import PermissionActionMaster from '../../constants/masters/PermissionActionMaster.json'
import { checkPermission } from "@/helpers/checkPermission"
import { DeleteCustomerModal, EditCustomerModal } from "@/components/pageComponents/customers/modal"
import { checkRouterQueryAndAutoFetchData } from "@/utils/parseUtils"
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
    const [information, setInformation] = useState(router.query.information ?? '')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const canCustomerOrder = user?.permissions.some(
    (permission) =>
      permission.name === PermissionMenuMaster.MANAGE_CUSTOMER &&
      permission.edit
  )


    const fetchCustomerData = async (page?: any, isClear?: boolean) => {
        setIsFetching(true)
        setIsSearch(false)
        try {
            const config = {
                params: {
                    information: isClear ? '' : information,
                    limit: (pageSize),
                    offset: (pageSize * (page ?? 0))
                }
            }
            const res = await fetchCustomerDataRequester(config)

            if (res.data !== null) {
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
    }, [])

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
        fetchCustomerData(0,true)
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
        await fetchCustomerData(0)
    }

    const handleOnChangePage = async (page: number): Promise<void> => {
        setPage(page)
        router.replace({
            pathname,
            query: { ...router.query, page }
        })
        await fetchCustomerData(page)
    }

    const handleOpenEdit = (customer: any) => {
        setSelectedCustomer(customer)
        setIsEditOpen(true)
    }

    const handleCloseEdit = () => {
        setIsEditOpen(false)
        setSelectedCustomer(null)
    }

    const confirmDelete = async (): Promise<void> => {
        if (deletingId == null) return
        setShowDeleteModal(false)
        try {
            await deleteCustomerRequester(deletingId)
            swalInstance.fire({
                icon: 'success',
                title: 'Success',
                text: 'Customer deleted successfully',
                showConfirmButton: false,
                showCloseButton: true
            })
            fetchCustomerData()
        } catch (error) {
            console.error(error)
            Alert({ data: error })
        } finally {
            setShowDeleteModal(false)
            setDeletingId(null)
        }
    }


    useEffect(() => {
        const page = PermissionMenuMaster.MANAGE_CUSTOMER
        const action = PermissionActionMaster.VIEW
        checkPermission({ user, page, action }, router)
    }, [user])

       useEffect(() => {
        checkRouterQueryAndAutoFetchData({
            query: router.query,
            fetchData: fetchCustomerData
        })
    }, [])


        useEffect(() => {
        if (!router.isReady) return
    
    
        if (router.query.information) {
          setInformation(router.query.information)
        }
        if (typeof router.query.limit === 'string' && !isNaN(Number(router.query.limit))) {
          setPageSize(Number(router.query.limit))
        }
      }, [router.isReady, router.query])
    


    return (
        <>
            <Head>
                <title>{title.CUSTOMER_TITLE}</title>
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
                                columns={Columns(setRows, handleOpenEdit, setShowDeleteModal, setDeletingId, canCustomerOrder)}
                                rows={rows}
                                isSearch={isSearch}
                            />
                        </Col>
                    </Row>

                    <EditCustomerModal
                        isOpen={isEditOpen}
                        onClose={handleCloseEdit}
                        customer={selectedCustomer}
                        onUpdated={fetchCustomerData}
                    />

                    <DeleteCustomerModal
                        visible={showDeleteModal}
                        onCancel={() => {
                            setShowDeleteModal(false)
                            setDeletingId(null)
                        }}
                        onConfirm={confirmDelete}
                    />


                </Container>
            </MainLayout>
        </>
    )
}

export default withAuthenticated(CustomersPage)