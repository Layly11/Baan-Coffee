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
import Swal, { Alert } from "@/helpers/sweetalert"
import { createProductRequester, deleteProductRequester, fetchCategoryRequester, fetchProductsDetailRequester, fetchSizeProductRequester, updateProductRequester } from "@/utils/requestUtils"
import { AddProductModal, CategoryModal, DeleteProductModal } from "@/components/pageComponents/productMenu/modal"
import { it } from "node:test"

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
    const [newCategoryList, setNewCategoryList] = useState([])
    const [newCategory, setNewCategory] = useState<string | string[]>()
    const [showAddModal, setShowAddModal] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [newFile, setNewFile] = useState<File | null>(null)
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
    const [editingItemId, setEditingItemId] = useState<number | null>(null)
    const [newProductName, setNewProductName] = useState<string>('')
    const [newPrice, setNewPrice] = useState<string>('')
    const [newDescription, setNewDescription] = useState<string>('')
    const [isActive, setIsActive] = useState<boolean>(false)
    const [isClearSearch, setIsClearSearch] = useState<boolean>(false)
    const [disableConfirm, setDisableConfirm] = useState(true)
    const [isRemoveImage, setIsRemoveImage] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [size, setSize] = useState<string | string[]>()
    const [sizeList, setSizeList] = useState([])
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
            const response = await fetchProductsDetailRequester(config)

            if (Array.isArray(response.data.products)) {
                const products = response.data.products
                setRows(products)
                setTotal(products.length)
            }


        } catch (err) {
            console.error(err)
            Alert({ data: err })
        } finally {
            setIsFetching(false)
        }
    }

    const fetchCategories = async () => {
        try {
            setIsFetching(true)

            const response = await fetchCategoryRequester()

            if (response.data !== null) {
                const category = response.data.category

                const uniqueCategoryNames: string[] = Array.from(
                    new Set(category.map((c: any) => c.name).filter(Boolean))
                )
                setCategoryList(uniqueCategoryNames)

                const formattedList = Array.from(category.map((c: any) => [c.id, { label: c.name }]))
                setNewCategoryList(formattedList as any)

            }

        } catch (err) {
            console.error(err)
            Alert({ data: err })
        }
        finally {
            setIsFetching(false)
        }
    }

    const fetchSize = async () => {
        try {
            setIsFetching(true)

            const response = await fetchSizeProductRequester()
            if (response.data !== null) {
                const sizes = response.data.size
                const formattedList = Array.from(sizes.map((c: any) => [c.id, { label: c.name }])) as any
                setSizeList(formattedList)
            }

        } catch (err) {
            console.error(err)
            Alert({ data: err })
        }
    }

    useEffect(() => {
        fetchProducts()
        fetchCategories()
        fetchSize()
        setIsClearSearch(false)
    }, [isClearSearch])

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

    const handleOnClearSearch = () => {
        setCategories(() => [])
        setIsClearSearch(true)
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

        fetchProducts(page)
    }

    const handleAddItem = () => {
        setShowAddModal(true)
    }


    const handleEditItem = (id: number): void => {
        const item = rows.find((i: any) => i.id === id)
        if (item !== null && item !== undefined) {
            setNewFile(null)
            setNewProductName(item.name)
            setNewCategory(String(item.category_id ?? ''))
            setNewPrice(item.price)
            setEditingItemId(item.id)
            setPreviewUrl(item.image_url)
            setNewDescription(item.description ?? '')
            setSize(item.sizes.map((s: any) => String(s.id)))
            setIsActive(item.status)
            setUploadedFileName(item.image_url?.split('/').slice(-1)[0].split('?')[0] ?? null)
            setShowAddModal(true)
        }
    }


    const handleFile = (file: File | null): void => {
        setNewFile(file)
    }

    const handleConfirmAdd = async (): Promise<void> => {
        try {
            console.log("NewDescription (Add): ", newDescription)
            console.log("ProductName (Add): ", newProductName)
            setShowAddModal(false)
            const formData = new FormData()
            if (newFile !== null && newFile !== undefined) formData.append('product_image', newFile)
            if (newProductName !== '') formData.append('product_name', newProductName)
            if (newCategory !== null && newCategory !== undefined) {
                formData.append('categories', Array.isArray(newCategory) ? newCategory.join(',') : newCategory)
            }
            if (newPrice !== '' && (Number(newPrice) > 200 || Number(newPrice) < 1)) {
                Swal.fire({ icon: 'error', title: 'Duration ควรอยู่ระหว่าง 1 ถึง 600 วินาที', text: 'กรุณาเลือกค่าใหม่อีกครั้ง', showCloseButton: true, showConfirmButton: false })
                return
            }
            if (newPrice !== '') {
                formData.append('price', newPrice)
            }
            if (newDescription !== '') {
                formData.append('description', newDescription)
            }
            if (size !== null && size !== undefined) {
                formData.append('sizes', Array.isArray(size) ? size.join(',') : size);
            }
            formData.append('is_active', isActive ? '1' : '0')

            await createProductRequester(formData)

            fetchProducts()
            setShowAddModal(false)
            resetProductForm()
            setEditingItemId(null)

        } catch (err) {
            resetProductForm()
            console.error(err)
            Alert({ data: err })
        }
    }

    const handleConfirmEdit = async (): Promise<void> => {
        try {
            setShowAddModal(false)

            const formData = new FormData()
            if (newFile !== null && newFile !== undefined) {
                formData.append('product_image', newFile)
            }
            if (newPrice !== '' && (Number(newPrice) > 200 || Number(newPrice) < 1)) {
                Swal.fire({ icon: 'error', title: 'Duration ควรอยู่ระหว่าง 1 ถึง 600 วินาที', text: 'กรุณาเลือกค่าใหม่อีกครั้ง', showCloseButton: true, showConfirmButton: false })
                return
            }
            formData.append('product_name', newProductName)
            if (newCategory !== undefined) {
                formData.append('categories', Array.isArray(newCategory) ? newCategory.join(',') : newCategory)
            }
            formData.append('price', newPrice)

            formData.append('description', newDescription)


            formData.append('is_active', isActive ? '1' : '0')

            if (size !== undefined) {
                formData.append('sizes', Array.isArray(size) ? size.join(',') : size);
            }

            formData.append("is_remove_image", String(isRemoveImage))

            await updateProductRequester(formData, editingItemId)
            fetchProducts()
            setShowAddModal(false)
            resetProductForm()
            setEditingItemId(null)
        } catch (err) {
            resetProductForm()
            console.error(err)
            Alert({ data: err })
        }
    }

    const resetProductForm = () => {
        setNewProductName('')
        setNewCategory([])
        setNewPrice('')
        setEditingItemId(null)
        setNewFile(null)
        setPreviewUrl(null)
        setUploadedFileName(null)
        setIsActive(false)
        setSize([])
        setNewDescription('')
    }

    useEffect(() => {
        if (!router.isReady) return
        if (router.query.categories) {
            setCategories(router.query.categories)
        }

        if (typeof router.query.page === 'string' && !isNaN(Number(router.query.page))) {
            setPage(Number(router.query.page))
        }
        if (typeof router.query.limit === 'string' && !isNaN(Number(router.query.limit))) {
            setPageSize(Number(router.query.limit))
        }
    }, [router.isReady, router.query])


    const handleDeleteItem = (id: number): void => {
        setDeletingId(id)
        setShowDeleteModal(true)
    }

    const confirmDelete = async (): Promise<void> => {
        if (deletingId == null) return
        try {
            await deleteProductRequester(deletingId)
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Item deleted successfully',
                showConfirmButton: false,
                showCloseButton: true
            })
            fetchProducts()
        } catch (error) {
            console.error(error)
            Alert({ data: error })
        } finally {
            setShowDeleteModal(false)
            setDeletingId(null)
        }
    }

    const handleAddCategory = () => {
        setShowCategoryModal(true)
    }

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
                        onAddCategory={handleAddCategory}
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
                                columns={Columns(handleEditItem, (id) => { handleDeleteItem(id) },)}
                                rows={rows}
                                isSearch={isSearch}
                            />
                        </Col>
                    </Row>
                    <AddProductModal
                        visible={showAddModal}
                        onClose={() => {
                            setShowAddModal(false)
                            resetProductForm()
                        }}
                        onConfirm={editingItemId != null ? handleConfirmEdit : handleConfirmAdd}
                        onChangeFile={handleFile}
                        editingItemId={editingItemId}
                        setPreviewUrl={setPreviewUrl}
                        previewUrl={previewUrl}
                        setUploadedFileName={setUploadedFileName}
                        uploadedFileName={uploadedFileName}
                        productName={newProductName}
                        setProductName={setNewProductName}
                        categories={newCategory}
                        setCategories={setNewCategory}
                        categoryList={newCategoryList}
                        price={newPrice}
                        setNewPrice={setNewPrice}
                        isActive={isActive}
                        setIsActive={() => setIsActive(prev => !prev)}
                        disableConfirm={disableConfirm}
                        setDisableConfirm={setDisableConfirm}
                        items={rows}
                        setRemoveImage={setIsRemoveImage}
                        newDescription={newDescription}
                        setNewDescription={setNewDescription}
                        size={size}
                        setSize={setSize}
                        sizeList={sizeList}
                    />
                    <DeleteProductModal
                        visible={showDeleteModal}
                        onCancel={() => {
                            setShowDeleteModal(false)
                            setDeletingId(null)
                        }}
                        onConfirm={confirmDelete}
                    />
                    <CategoryModal
                        visible={showCategoryModal}
                        onClose={() => {
                            setShowCategoryModal(false)
                            fetchCategories()
                        }}
                    />
                </Container>
            </MainLayout >
        </>
    )
}

export default withAuthenticated(ProductMenuPage)