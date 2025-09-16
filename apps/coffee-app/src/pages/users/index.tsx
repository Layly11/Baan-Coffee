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
import Table from "@/components/commons/table"
import swalInstance, { Alert } from "@/helpers/sweetalert"
import { deleteCustomerRequester, fetchCustomerDataRequester, fetchUserDataRequester } from "@/utils/requestUtils"
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'
import PermissionActionMaster from '../../constants/masters/PermissionActionMaster.json'
import { checkPermission } from "@/helpers/checkPermission"
import { DeleteCustomerModal, EditCustomerModal } from "@/components/pageComponents/customers/modal"
import { Header } from "@/components/pageComponents/users/header"
import { Columns } from "@/components/pageComponents/users/column"
import { checkRouterQueryAndAutoFetchData } from "@/utils/parseUtils"
const pathname = '/users'

const UserPage = () => {
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
    const [role, setRole] = useState(router.query.role ?? '')

    const fetchUserData = async (page?: any) => {
        setIsFetching(true)
        setIsSearch(false)
        try {
            const config = {
                params: {
                    information,
                    role,
                    limit: (pageSize),
                    offset: (pageSize * (page ?? 0))
                }
            }
            const res = await fetchUserDataRequester(config)
            console.log("res: ", res.data)
            if (res.data !== null) {
                const users = res.data.users
                const total = res.data.total
                setRows(users)
                setTotal(total)
            }
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        } finally {
            setIsFetching(false)
        }
    }

    const handleOnClearSearch = async () => {
        setRows([])
        setTotal(0)
        setPage(0)
        setInformation('')
        setRole('')
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
        await fetchUserData()
    }

    const handleOnChangePage = async (page: number): Promise<void> => {
        setPage(page)
        router.replace({
            pathname,
            query: { ...router.query, page }
        })
        await fetchUserData()
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
            // fetchCustomerData()
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
            if (!router.isReady) return
            checkRouterQueryAndAutoFetchData({
                query: router.query,
                fetchData: fetchUserData
            })
        }, [router.isReady, router.query])


    return (
        <>
            <Head>
                <title>{title.USER_TITLE}</title>
            </Head>

            <MainLayout isFetching={user === null} >
                <Container fluid>
                    <Row justify='between' style={{ margin: '0px -10px' }}>
                        <Col sm={12}>
                            <Title>Users</Title>
                        </Col>
                    </Row>

                    <Header
                        information={information}
                        role={role}
                        setRole={setRole}
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
                                columns={Columns()}
                                rows={rows}
                                isSearch={isSearch}
                            />
                        </Col>
                    </Row>

                    {/* <EditCustomerModal
                        isOpen={isEditOpen}
                        onClose={handleCloseEdit}
                        customer={selectedCustomer}
                        onUpdated={fetchCustomerData}
                    /> */}

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

export default withAuthenticated(UserPage)