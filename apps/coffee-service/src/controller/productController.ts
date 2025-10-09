import { NextFunction, Request, Response } from "express"
import { ProductModel, CategoriesModel, sequelize, TopProductModel, SizeModel, ProductSizeModel } from '@coffee/models'
import { getBlobSasToken, uploadToAzureBlob, getblobUrlSas, parseBlobUrl, deleteFromAzureImage } from '../utils/azureBlob'
import { ServiceError } from "@coffee/helpers"
import ProductMasterError from '../constants/errors/product.error.json'
import path from "path"
import { v4 as uuidv4 } from 'uuid'
import { Sequelize } from "sequelize"
import { AuditLogActionType, AuditLogMenuType, CreateAuditLog } from "../constants/commons/createAuditLog"

const allowedExtensions = ['.png', '.jpg', '.jpeg']

export const isValidImageMagicNumber = (buffer: Buffer, mimetype: string): boolean => {
    if (!buffer || buffer.length < 8) return false

    const bytes = buffer.subarray(0, 8)
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ')

    if (mimetype === 'image/png') {
        return hex.startsWith('89 50 4e 47 0d 0a 1a 0a')
    }

    if (mimetype === 'image/jpg') {
        return hex.startsWith('ff d8 ff')
    }

    if (mimetype === 'image/jpeg') {
        return hex.startsWith('ff d8 ff')
    }

    return false
}

export const getProductData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categories, limit, offset, audit_action: auditAction } = req.query
        const portal = req.user as any
        const categoryArray = Array.isArray(categories)
            ? categories
            : typeof categories === 'string'
                ? categories.split(',').map(c => c.trim()).filter(Boolean)
                : []



        const data = await ProductModel.findAll({
            include: [
                {
                    model: CategoriesModel,
                    as: 'category',
                    attributes: ['id', 'name'],
                    ...(categoryArray.length > 0 && {
                        where: {
                            name: categoryArray
                        },
                    })
                },
                {
                    model: SizeModel,
                    as: 'sizes',
                    attributes: ['id', 'name', 'volume_ml', 'extra_price'],
                    through: { attributes: [] }
                }
            ],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
            order: [['createdAt', 'ASC']]
        })


        // for (const product of data) {
        //     if (product.image_url) {
        //         const url = product.image_url
        //         const { blobName } = parseBlobUrl(url)
        //         const blobUrlSas = await getblobUrlSas(blobName)
        //         product.image_url = blobUrlSas
        //     }
        // }

        const products = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            status: product.status,
            image_url: product.image_url,
            description: product.description,
            category_id: product.category.id || null,
            category_name: product.category?.name || null,
            sizes: product.sizes?.map((s: any) => (
                {
                    id: s.id,
                    name: s.name,
                    volume_ml: s.volume_ml,
                    extra_price: s.extra_price
                }
            ))
        }));


        if (auditAction) {
            res.locals.audit = CreateAuditLog(
                {
                    menu: AuditLogMenuType.PRODUCT_MENU,
                    action: auditAction,
                    editorName: portal.username,
                    editorRole: portal.role.name,
                    eventDateTime: new Date(),
                    staffId: portal.id,
                    staffEmail: portal.email,
                    channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                    searchCriteria: JSON.stringify({ query: req.query }),
                    previousValues: undefined,
                    newValues: undefined,
                    recordKeyValues: undefined,
                    isPii: true
                }
            )
        }

        res.locals.products = products
        return next()
    } catch (err) {
        next(err)
    }
}


export const getProductSize = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sizes = await SizeModel.findAll()

        res.locals.sizes = sizes

        return next()
    } catch (err) {
        next(err)
    }
}



export const createProduct = () => async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction()
    try {
        const {
            product_name: productName,
            categories,
            price,
            description,
            is_active: isActive
        } = req.body

        const portal = req.user as any
        let { sizes } = req.body

        const file = (req.file!) || null

        if (price !== undefined && (price > 200 || price < 1)) {
            await transaction.rollback()
            return next(new ServiceError(ProductMasterError.ERR_PRICE_CONSTRAINT))
        }

        if (file !== null && file !== undefined && !file.mimetype.startsWith('image/')) {
            await transaction.rollback()
            return next(new ServiceError(ProductMasterError.FILE_TYPE_REQUIRE_IMAGE))
        }

        if (file !== null && file !== undefined && file.size > 5 * 1024 * 1024) {
            await transaction.rollback()
            return next(new ServiceError(ProductMasterError.FILE_SIZE_LIMIT))
        }

        const fileExtension = path.extname(file.originalname).toLowerCase()

        if (!allowedExtensions.includes(fileExtension)) {
            await transaction.rollback()
            return next(new ServiceError(ProductMasterError.FILE_TYPE_REQUIRE_IMAGE))
        }

        if (!isValidImageMagicNumber(file.buffer, file.mimetype)) {
            await transaction.rollback()
            return next(new ServiceError(ProductMasterError.FILE_TYPE_REQUIRE_IMAGE))
        }


        if (!productName) {
            return next(new ServiceError(ProductMasterError.PRODUCT_NAME_REQUIRE))
        }
        if (!categories) {
            return next(new ServiceError(ProductMasterError.CATEGOREIS_REQUIRE))
        }
        if (!sizes) {
            return next(new ServiceError(ProductMasterError.SIZE_REQUIRE))
        }
        if (!price) {
            return next(new ServiceError(ProductMasterError.PRICE_REQUIRE))
        }
        if (!isActive) {
            return next(new ServiceError(ProductMasterError.IS_ACTIVE_REQUIRE))
        }

        if (typeof sizes === 'string') {
            sizes = sizes.split(',').map((s: string) => parseInt(s.trim(), 10))
        }


        let imageUrl
        if (file) {
            try {
                const fileExtension = path.extname(file.originalname).toLowerCase()
                const fileName = `Product_${uuidv4().substring(0, 8)}${fileExtension}`
                const blobPath = `${fileName}`

                imageUrl = await uploadToAzureBlob({
                    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
                    blobPath,
                    data: file.buffer,
                    contentType: file.mimetype
                })
            } catch (err) {
                await transaction.commit()
                next(err)
            }
        }
        const newProduct = await ProductModel.create(
            {
                name: productName,
                price,
                category_id: categories,
                status: isActive,
                image_url: imageUrl,
                description: description
            },
            { transaction }
        )
        if (sizes && Array.isArray(sizes)) {
            for (const sizeId of sizes) {
                await ProductSizeModel.create(
                    {
                        product_id: newProduct.id,
                        size_id: sizeId
                    },
                    { transaction }
                )
            }
        }

        res.locals.newProduct = newProduct

        await transaction.commit()

        res.locals.audit = CreateAuditLog({
            menu: AuditLogMenuType.PRODUCT_MENU,
            action: AuditLogActionType.CREATE_PRODUCT,
            editorName: portal.username,
            editorRole: portal.role.name,
            eventDateTime: new Date(),
            staffId: portal.id,
            staffEmail: portal.email,
            channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
            searchCriteria: undefined,
            previousValues: undefined,
            newValues: undefined,
            recordKeyValues: JSON.stringify({
                file: {
                    originalname: file.originalname
                },
                body: req.body
            }),
            isPii: true
        })

        return next()

    } catch (err) {
        next(err)
    }
}

export const updateProduct = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id)
        const item = await ProductModel.findByPk(id)

        const previous_values = {
            image_url: item?.image_url,
            name: item?.name,
            categories_id: item?.category_id,
            price: item?.price,
            description: item?.description,
            status: item?.status
        }

        const newValues: Record<string, any> = {}

        if (!item) {
            return next(new ServiceError(ProductMasterError.PRODUCT_NOT_FOUND))
        }
        const {
            product_name: productName,
            categories,
            price,
            description,
            is_active: isActive,
            is_remove_image: isRemoveImage
        } = req.body

        console.log(req.body)

        const portal = req.user as any

        let { sizes } = req.body

        if (typeof sizes === 'string') {
            sizes = sizes.split(',').map((s: string) => parseInt(s.trim(), 10))
        }


        if (price !== undefined && (price > 200 || price < 1)) {
            return next(new ServiceError(ProductMasterError.ERR_PRICE_CONSTRAINT))
        }

        const file = req.file

        if (file !== null && file !== undefined && !file.mimetype.startsWith('image/')) {
            return next(new ServiceError(ProductMasterError.FILE_TYPE_REQUIRE_IMAGE))
        }

        if (file !== null && file !== undefined && file.size > 5 * 1024 * 1024) {
            return next(new ServiceError(ProductMasterError.FILE_SIZE_LIMIT))
        }


        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase()
            const fileName = `Product_${uuidv4().substring(0, 8)}${fileExtension}`
            const blobPath = `${fileName}`

            const image_url = await uploadToAzureBlob({
                containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
                blobPath,
                data: file.buffer,
                contentType: file.mimetype
            })
            item.image_url = image_url
            newValues.image_url = image_url
        }

        if (isRemoveImage === 'true') {
            if (item.image_url) {
                // await deleteFromAzureImage({
                //     containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
                //     blobPath: parseBlobUrl(item.image_url).blobName
                // })
                item.image_url = null
            }
        }


        if (productName !== undefined) {
            item.name = productName
            newValues.name = productName
        }
        if (categories !== undefined) {
            const categoryId = Number(categories)
            if (isNaN(categoryId)) {
                return next(new ServiceError(ProductMasterError.INVALID_CATEGORY_ID))
            }
            item.category_id = categoryId
            newValues.categories_id = categoryId
        }
        if (price !== undefined) {
            item.price = price
            newValues.price = price
        }
        if (description !== undefined || description !== null) {
            item.description = description
            newValues.description = description
        }
        if (isActive !== undefined) {
            item.status = isActive
            newValues.status = isActive
        }
        await item.save()

        if (sizes && Array.isArray(sizes)) {
            // ลบ size เดิมทั้งหมด
            await ProductSizeModel.destroy({ where: { product_id: item.id } })

            // เพิ่ม size ใหม่
            const sizeData = sizes.map((sizeId: number) => ({
                product_id: item.id,
                size_id: sizeId
            }))
            await ProductSizeModel.bulkCreate(sizeData)
        }

        res.locals.audit = CreateAuditLog(
            {
                menu: AuditLogMenuType.PRODUCT_MENU,
                action: AuditLogActionType.EDIT_PRODUCT,
                editorName: portal.username,
                editorRole: portal.role.name,
                eventDateTime: new Date(),
                staffId: portal.id,
                staffEmail: portal.email,
                channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                searchCriteria: undefined,
                previousValues: JSON.stringify(previous_values),
                newValues: JSON.stringify(newValues),
                recordKeyValues: undefined,
                isPii: true
            }
        )

        res.locals.item = item

        return next()
    } catch (err) {
        next(err)
    }
}


export const deleteProduct = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id
        const item = await ProductModel.findByPk(id)

        const portal = req.user as any

        if (!item) {
            return next(new ServiceError(ProductMasterError.PRODUCT_NOT_FOUND))
        }
        const recordKeyValues = {
            id: item.id,
            imageUrl: item.image_url
        }

        await TopProductModel.destroy({ where: { product_id: id } })

        await ProductSizeModel.destroy({ where: { product_id: id } })
        // if (item.image_url) {
        //     try {
        //         await deleteFromAzureImage({
        //             containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
        //             blobPath: parseBlobUrl(item.image_url).blobName
        //         })
        //     } catch (err) {
        //         return next(err)
        //     }
        // }

        await item.destroy()


        res.locals.audit = CreateAuditLog(
            {
                menu: AuditLogMenuType.PRODUCT_MENU,
                action: AuditLogActionType.DELETE_PRODUCT,
                editorName: portal.username,
                editorRole: portal.role.name,
                eventDateTime: new Date(),
                staffId: portal.id,
                staffEmail: portal.email,
                channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                searchCriteria: undefined,
                previousValues: undefined,
                newValues: undefined,
                recordKeyValues: JSON.stringify(recordKeyValues),
                isPii: true
            }
        )

        return next()
    } catch (err) {
        next(err)
    }
}

export const getCategory = () => async (req: Request, res: Response, next: NextFunction) => {
    try {

        const category = await CategoriesModel.findAll({ attributes: ['id', 'name'] })

        res.locals.category = category

        return next()
    } catch (err) {
        next(err)
    }
}


export const createCategory = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { category_name: categoryName } = req.body

        const category = await CategoriesModel.findAll()

        if (category.length >= 4) {
            return next(new ServiceError(ProductMasterError.CATEGORY_LIMIT))
        }

        if (!categoryName) {
            return next(ProductMasterError.CATEGORIES_NAME_NOT_FOUND)
        }

        const newCategories = await CategoriesModel.create(
            {
                name: categoryName
            }
        )

        res.locals.newCategories = newCategories

        return next()

    } catch (err) {
        next(err)
    }
}

export const updateCategory = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        const item = await CategoriesModel.findByPk(id)

        const { category_name: categoryName } = req.body

        if (!item) {
            return next(ProductMasterError.CATEGORIES_NAME_NOT_FOUND)
        }

        item.name = categoryName

        await item.save()

        res.locals.item = item

        next()
    } catch (err) {
        next(err)
    }
}

export const deleteCategory = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id

        const productsUsingCategory = await ProductModel.count({ where: { category_id: id } });

        if (productsUsingCategory > 0) {
            return next(new ServiceError(ProductMasterError.CATEGORY_IS_IN_USE_BY_SOME_PRODUCT))
        }

        const item = await CategoriesModel.findByPk(id)

        if (!item) {
            return next(ProductMasterError.CATEGORIES_NAME_NOT_FOUND)
        }

        await item.destroy()

        return next()
    } catch (err) {
        next(err)
    }
}

export const getBestSeller = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bestSellers = await TopProductModel.findAll({
            attributes: [
                'product_id',
                [Sequelize.fn('SUM', Sequelize.col('total_sold')), 'totalSold'],
                [Sequelize.fn('SUM', Sequelize.col('total_sales')), 'totalSales'],
            ],
            include: [
                {
                    model: ProductModel,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'image_url', 'description'],
                    where: { status: 1 }
                },
            ],
            group: ['product.id'],
            order: [[Sequelize.literal('totalSold'), 'DESC']],
            limit: 3
        });

        const bestSellerMapping = bestSellers.map((value: any) => ({
            product_id: value.product.id,
            name: value.product.name,
            Desc: value.product.description,
            price: value.product.price,
            imageSource: value.product.image_url,
            totalSold: value.getDataValue('totalSold'),
            totalSales: value.getDataValue('totalSales')
        }));

        res.locals.bestSeller = bestSellerMapping;

        return next();

    } catch (err) {
        next(err);
    }
}


export const getCategoryMobile = () => async (req: Request, res: Response, next: NextFunction) => {
    try {

        const category = await CategoriesModel.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: ProductModel,
                    as: 'products',
                    required: true,
                    where: { status: 1 }
                }
            ]
        })

        const categoryMapped = category.map((cat) => ({
            id: cat.id,
            name: cat.name
        }))

        res.locals.category = categoryMapped

        return next()
    } catch (err) {
        next(err)
    }
}

export const getProductByCategory = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await CategoriesModel.findAll({
            attributes: ['id', 'name'],
            include: [
                {
                    model: ProductModel,
                    as: 'products',
                    where: { status: 1 }

                }
            ]
        })

        const mappedResult: Record<string, any[]> = {}

        for (const categories of category) {
            const categoriesName = categories.name
            const products = (categories as any).products || []

            mappedResult[categoriesName] = products.map((product: any) => ({
                id: product.id,
                title: product.name,
                price: `${product.price} Bath`,
                image: product.image_url,
                desc: product.description,
            }))
        }

        res.locals.productsData = mappedResult

        return next()
    } catch (err) {
        next(err)
    }
}


export const getSizebyProduct = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.id

        const sizes = await ProductSizeModel.findAll({
            where: { product_id: productId },
            include: [
                {
                    model: SizeModel,
                    as: 'size',
                }
            ]
        })


        const mappedSizeProduct = sizes.map((s: any) => (
            {
                id: s.size.id,
                title: s.size.name,
                Quntity: s.size.volume_ml,
                extra_price: s.size.extra_price
            }
        ))

        res.locals.sizes = mappedSizeProduct
        return next()
    } catch (err) {
        next(err)
    }
}