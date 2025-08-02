import { NextFunction, Request, Response } from "express"
import { ProductModel, CategoriesModel, sequelize, TopProductModel } from '@coffee/models'
import { getBlobSasToken, uploadToAzureBlob, getblobUrlSas, parseBlobUrl, deleteFromAzureImage } from '../utils/azureBlob'
import { ServiceError } from "@coffee/helpers"
import ProductMasterError from '../constants/errors/product.error.json'
import path from "path"
import { v4 as uuidv4 } from 'uuid'
import { Sequelize } from "sequelize"
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
                    attributes: ['id', 'name'],
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
            category_name: product.category?.name || null
        }));
        res.locals.products = products
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
            description,
            is_active: isActive,
            is_remove_image: isRemoveImage
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

        if (isRemoveImage === 'true') {
            if (item.image_url) {
                await deleteFromAzureImage({
                    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
                    blobPath: parseBlobUrl(item.image_url).blobName
                })
                item.image_url = null
            }
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
        if (description !== undefined) {
            item.description = description
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


export const deleteProduct = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id
        const item = await ProductModel.findByPk(id)

        if (!item) {
            return next(new ServiceError(ProductMasterError.PRODUCT_NOT_FOUND))
        }

        await TopProductModel.destroy({where: {product_id: id}})

        if (item.image_url) {
            try {
                await deleteFromAzureImage({
                    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME!,
                    blobPath: parseBlobUrl(item.image_url).blobName
                })
            } catch (err) {
                return next(err)
            }
        }

        await item.destroy()

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
                'id',
                'product_id',
                [Sequelize.fn('SUM', Sequelize.col('total_sold')), 'totalSold'],
                [Sequelize.fn('SUM', Sequelize.col('total_sales')), 'totalSales'],
            ],
            include: [
                {
                    model: ProductModel,
                    as: 'product',
                    attributes: ['name', 'price', 'image_url', 'description'],
                    where: { status: 1}
                },
            ],
            group: ['top_products.id', 'product_id', 'product.id'],
            order: [[Sequelize.literal('totalSold'), 'DESC']],
        });


        const bestSellerMapping = bestSellers.map((value: any) => ({
            id: value.id,
            name: value.product.name,
            Desc: value.product.description,
            price: value.product.price,
            imageSource: value.product.image_url
        }))


        res.locals.bestSeller = bestSellerMapping

        return next()

    } catch (err) {
        next(err)
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
                    required: true
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

        for(const categories of category) {
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