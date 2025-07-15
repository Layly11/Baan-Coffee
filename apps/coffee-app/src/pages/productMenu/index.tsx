import Head from "next/head"
import title from '../../constants/title.json'
import MainLayout from "@/components/layouts/mainLayout"
import { useSelector } from "react-redux"
import { UseSelectorProps } from "@/props/useSelectorProps"
import { Col, Container, Row } from "react-grid-system"
import Title from "@/components/commons/title"
import withAuthenticated from "@/hocs/withAuthenticated"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'
import PermissionActionMaster from '../../constants/masters/PermissionActionMaster.json'
import { checkNullUndefiendEmptyString, checkRouterQueryAndAutoFetchData, parseToArrayAndRemoveSelectAllValue } from "@/utils/parseUtils"
import { checkPermission } from "@/helpers/checkPermission"
import { Header } from '../../components/pageComponents/productMenu/header'
import Table from "@/components/commons/table"
import { Columns } from "@/components/pageComponents/productMenu/column"
import { Alert } from "@/helpers/sweetalert"
import { fetchProductsDetail } from "@/utils/requestUtils"

const pathname = '/productMenu'
const ProductMenuPage = () => {
    const user = useSelector((state: UseSelectorProps) => state.user)
    const router = useRouter()

    const [isFetching, setIsFetching] = useState(false)
    const [isSearch, setIsSearch] = useState(false)
    const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
    const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
    const [total, setTotal] = useState(0)
    const [rows, setRows] = useState<any>([])

    const [categories, setCategories] = useState<string | string[]>(router.query.categories ?? [])
    const [categortList, setCategoryList] = useState<string[]>([])
    const fetchProducts = async (page?: number) => {
        try {
            setIsFetching(true)
            const config = {
                params: {
                    categories: parseToArrayAndRemoveSelectAllValue(checkNullUndefiendEmptyString(categories)),
                    limit: (pageSize),
                    offset: (pageSize * (page ?? 0))
                }
            }
            const response = await fetchProductsDetail(config)
            console.log('Products: ', response.data.products)

            if (Array.isArray(response.data.products)) {
                const products = response.data.products
                const category = response.data.categoryList
                setRows(products)
                setTotal(products.length)

                const uniqueCategoryNames: string[] = Array.from(
                    new Set(category.map((c: any) => c.name).filter(Boolean))
                )
                setCategoryList(uniqueCategoryNames)
            }


        } catch (err) {
            console.error(err)
            Alert({ data: err })
        } finally {
            setIsFetching(false)
        }
    }
    useEffect(() => {
        fetchProducts()
    },[])
    const handleOnClickSearch = async (): Promise<void> => {
        setIsSearch(false)
        setPage(0)
        await router.replace({
            pathname,
            query: {
                categories
            }
        })
        fetchProducts()
    }

    const handleOnClearSearch = (): void => {
        setCategories([])
        router.replace({
            pathname
        })
    }



    useEffect(() => {
        const page = PermissionMenuMaster.PRODUCT_MENU
        const action = PermissionActionMaster.VIEW
        checkPermission({ user, page, action }, router)
    }, [user])

    const handleOnChangePage = async (page: number): Promise<void> => {
        setPage(page)
        router.replace({
            pathname,
            query: { ...router.query, page }
        })

    }

    const handleAddItem = () => {

    }
    //   useEffect(() => {
    //     if (!router.isReady) return
    //     checkRouterQueryAndAutoFetchData({
    //       query: router.query,
    //       fetchData: fetchDashboardSummaryList
    //     })
    //   }, [router.isReady, router.query])


    return (
        <>
            <Head>
                <title>{title.PRODUCT_MENU_TITLE}</title>
            </Head>

            <MainLayout isFetching={user === null} >

                <Container fluid>
                    <Row justify='between' style={{ margin: '0px -10px' }}>
                        <Col sm={12}>
                            <Title>Product Menu</Title>
                        </Col>
                    </Row>
                    <Header
                        categories={categories}
                        setCategories={setCategories}
                        categoryList={categortList}
                        onAddItem={handleAddItem}
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
            </MainLayout >
        </>
    )
}

export default withAuthenticated(ProductMenuPage)