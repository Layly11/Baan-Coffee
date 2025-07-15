import { NextFunction, Request, Response } from "express"
import { ProductModel, CategoriesModel } from '@coffee/models'

export const getProductData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit, offset } = req.query
        const data = await ProductModel.findAll({
            include: [
                {
                    model: CategoriesModel,
                    as: 'category',
                    attributes: ['name']
                }
            ],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
            order: [['createdAt', 'ASC']]
        })

        const products = data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            status: product.status,
            image_url: product.image_url,
            category_name: product.category?.name || null
        }));
        res.locals.products = products
        next()
    } catch (err) {
        next(err)
    }
} 