// import withAuthenticated from "@/hocs/withAuthenticated"
// import Head from "next/head"
// import title from '../../constants/title.json'
// import MainLayout from "@/components/layouts/mainLayout"
// import { useState } from "react"
// import { useSelector } from "react-redux"
// import { useRouter } from "next/router"
// import { UseSelectorProps } from "@/props/useSelectorProps"
// import { Col, Container, Row } from "react-grid-system"
// import Title from "@/components/commons/title"
// import { Header } from "@/components/pageComponents/customers/header"
// import Table from "@/components/commons/table"

// const pathname = '/customers'

// const CustomersPage = () => {
//     const user = useSelector((state: UseSelectorProps) => state.user)
//     const router = useRouter()
//     const [isFetching, setIsFetching] = useState(false)
//     const [isSearch, setIsSearch] = useState(true)
//     const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
//     const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
//     const [total, setTotal] = useState(0)
//     const [rows, setRows] = useState<any>([])

//     const handleOnClearSearch = async () => {
//         router.push({
//             pathname,
//             query: {}
//         })
//     }

//     const handleOnClickSearch = async () => {
//         setIsSearch(false)
//         setPage(0)
//         router.push({
//             pathname,
//             query: {
//             }
//         })
//         // await fetchOrderData()
//     }

//     const handleOnChangePage = async (page: number): Promise<void> => {
//         setPage(page)
//         router.replace({
//             pathname,
//             query: { ...router.query, page }
//         })
//         await fetchDashboardSummaryList(page)
//     }


//     return (
//         <>
//             <Head>
//                 <title>{title.ORDERS_TITLE}</title>
//             </Head>

//             <MainLayout isFetching={user === null} >
//                 <Container fluid>
//                     <Row justify='between' style={{ margin: '0px -10px' }}>
//                         <Col sm={12}>
//                             <Title>Customers</Title>
//                         </Col>
//                     </Row>

//                     <Header
//                         handleOnClearSearch={handleOnClearSearch}
//                         handleOnClickSearch={handleOnClickSearch}
//                     />

//                     <Row style={{ margin: '20px -10px 0px -10px' }}>
//                         <Col xs={12}>
//                             <Table
//                                 isFetching={isFetching}
//                                 total={total}
//                                 pageSize={pageSize}
//                                 setPageSize={setPageSize}
//                                 setPage={handleOnChangePage}
//                                 page={page}
//                                 columns={Columns(setRows)}
//                                 rows={rows}
//                                 isSearch={isSearch}
//                             />
//                         </Col>
//                     </Row>

//                 </Container>
//             </MainLayout>
//         </>
//     )
// }

// export default withAuthenticated(CustomersPage)