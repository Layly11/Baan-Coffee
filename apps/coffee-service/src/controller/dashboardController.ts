import { NextFunction, Request, Response } from "express";
import {DailySummaryModel, InventoryStatusModel, OrderModel, ShiftTodayModel, TopProductModel} from '@coffee/models'
import { momentAsiaBangkok } from "@coffee/helpers";
import { Op } from 'sequelize'

export const getDashBoardData = () => async (req: Request, res: Response, next: NextFunction) => {
    const {
        start_date: startDate, 
        end_date: endDate, 
        limit, 
        offset} = req.query as any

    const where = {
        ...(startDate && endDate && {
            date: {
                [Op.between]: [
              momentAsiaBangkok(startDate).startOf('day').toISOString(),
              momentAsiaBangkok(endDate).endOf('day').toISOString()
            ]
            }
        })
    }
    const {count, rows} = await DailySummaryModel.findAndCountAll({
        include: [
            {
                model: ShiftTodayModel,
                as: 'shifts'
            },
            {
                model: InventoryStatusModel,
                as: 'inventory_statuses'
            },
            {
                model: TopProductModel,
                as: 'top_products'
            }
        ],
        where,
        limit: Number(limit) || 10,
        offset: Number(offset) || 0,
        order: [['createdAt', 'ASC']],
        distinct: true
    })
    console.log('WHERE : ', where.date)
    res.locals.total = count
    res.locals.summaryList = rows
    next()
}