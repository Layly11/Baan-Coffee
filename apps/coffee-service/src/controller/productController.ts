import { NextFunction, Request, Response } from "express"
import { ProductModel, CategoriesModel, sequelize } from '@coffee/models'
import { getBlobSasToken, uploadToAzureBlob, getblobUrlSas, parseBlobUrl } from '../utils/azureBlob'
import { ServiceError } from "@coffee/helpers"
import ProductMasterError from '../constants/errors/product.error.json'
import path from "path"
import { v4 as uuidv4 } from 'uuid'
export const getProductData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categories, limit, offset } = req.query

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
                    attributes: ['name'],
                    ...(categoryArray.length > 0 && {
                        where: {
                            name: categoryArray
                        },
                    })
                }
            ],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
            order: [['createdAt', 'ASC']]
        })

        for (const product of data) {
            if (product.image_url) {
                const url = product.image_url
                const { blobName } = parseBlobUrl(url)
                const blobUrlSas = await getblobUrlSas(blobName)
                product.image_url = blobUrlSas
            }
        }

        const categoryList = await CategoriesModel.findAll({ attributes: ['id', 'name'] })

        const products = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            status: product.status,
            image_url: product.image_url,
            category_id: product.category_id,
            category_name: product.category?.name || null
        }));
        res.locals.products = products
        res.locals.categoryList = categoryList
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
            is_active: isActive
        } = req.body

        const file = (req.file!) || null

        if (price !== undefined && (price > 200 || price < 1)) {
            await transaction.rollback()
            return next(new ServiceError(ProductMasterError.ERR_PRICE_CONSTRAINT))
        }

        if (file !== null && file !== undefined && !file.mimetype.startsWith('image/')) {
            await transaction.rollback()
            return next(new ServiceError(ProductMasterError.FILE_TYPE_REQUIRE_IMAGE))
        }

        if (file !== null && file !== undefined && file.size > 2 * 1024 * 1024) {
            await transaction.rollback()
            return next(new ServiceError(ProductMasterError.FILE_SIZE_LIMIT))
        }
        if (!productName) {
            return next(new ServiceError(ProductMasterError.PRODUCT_NAME_REQUIRE))
        }
        if (!categories) {
            return next(new ServiceError(ProductMasterError.CATEGOREIS_REQUIRE))
        }
        if (!price) {
            return next(new ServiceError(ProductMasterError.PRICE_REQUIRE))
        }
        if (!isActive) {
            return next(new ServiceError(ProductMasterError.IS_ACTIVE_REQUIRE))
        }

        let imageUrl
        if (file) {
            const fileExtension = path.extname(file.originalname).toLowerCase()
            const fileName = `Product_${uuidv4().substring(0, 8)}${fileExtension}`
            const blobPath = `${fileName}`

            imageUrl = await uploadToAzureBlob({
                containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
                blobPath,
                data: file.buffer,
                contentType: file.mimetype
            })
        }

        const newProduct = await ProductModel.create(
            {
                name: productName,
                price,
                category_id: categories,
                status: isActive,
                image_url: imageUrl
            },
            { transaction }
        )

        res.locals.newProduct = newProduct

        await transaction.commit()

        return next()

    } catch (err) {
        next(err)
    }
}

export const updateProduct = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id)
        const item = await ProductModel.findByPk(id)

        if (!item) {
            return next(new ServiceError(ProductMasterError.PRODUCT_NOT_FOUND))
        }
        const {
            product_name: productName,
            categories,
            price,
            is_active: isActive
        } = req.body

        if (price !== undefined && (price > 200 || price < 1)) {
            return next(new ServiceError(ProductMasterError.ERR_PRICE_CONSTRAINT))
        }

        const file = req.file

        if (file !== null && file !== undefined && !file.mimetype.startsWith('image/')) {
            return next(new ServiceError(ProductMasterError.FILE_TYPE_REQUIRE_IMAGE))
        }

        if (file !== null && file !== undefined && file.size > 2 * 1024 * 1024) {
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
        }
        else{
             item.image_url = null
        }

        if (productName !== undefined) {
            item.name = productName
        }
        if (categories !== undefined) {
            const categoryId = Number(categories)
            if (isNaN(categoryId)) {
                return next(new ServiceError(ProductMasterError.INVALID_CATEGORY_ID))
            }
            item.category_id = categoryId
        }
        if (price !== undefined) {
            item.price = price
        }
        if (isActive !== undefined) {
            item.status = isActive
        }
        await item.save()

        res.locals.item = item

        return next()
    } catch (err) {
        next(err)
    }
}