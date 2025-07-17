import { NextFunction, Request, Response } from "express"
import { ProductModel, CategoriesModel } from '@coffee/models'
import {getBlobSasToken, uploadToAzureBlob} from '../utils/azureBlob'

export const getProductData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categories, limit, offset } = req.query

        const categoryArray = Array.isArray(categories)
            ? categories
            : typeof categories === 'string'
                ? categories.split(',').map(c => c.trim()).filter(Boolean)
                : []

        console.log('CategoriesArray: ', categories)

        const sasToken = getBlobSasToken('Cappuccino.png')

        console.log(`https://baancoffee.blob.core.windows.net/product-images/Cappuccino.png?${sasToken}`)
        const image_url = `https://baancoffee.blob.core.windows.net/product-images/Cappuccino.png?${sasToken}`
        console.log('sasToken: ',sasToken)


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

        const categoryList = await CategoriesModel.findAll({ attributes: ['name'] })

        const products = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            status: product.status,
            image_url: image_url,
            category_name: product.category?.name || null
        }));
        res.locals.products = products
        res.locals.categoryList = categoryList
        next()
    } catch (err) {
        next(err)
    }
} 