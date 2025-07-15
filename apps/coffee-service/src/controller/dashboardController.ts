import { NextFunction, Request, Response } from "express";
import { DailySummaryModel, InventoryStatusModel, OrderModel, ShiftTodayModel, TopProductModel } from '@coffee/models'
import { momentAsiaBangkok, ServiceError } from "@coffee/helpers";
import { Op } from 'sequelize'
import { dayjs } from "@coffee/helpers";
import DashBoardErrorMaster from '../constants/errors/dashboard.error.json'

export const getDashBoardData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            start_date: startDate,
            end_date: endDate,
            limit,
            offset } = req.query as any

        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return next(new ServiceError(DashBoardErrorMaster.ERR_DATE_INVALID_FORMAT))
        }

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
        const { count, rows } = await DailySummaryModel.findAndCountAll({
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

        const summary = rows.map((summary: any) => ({
            id: summary.id,
            date: dayjs(summary.date).format('DD/MM/YYYY'),
            totalSales: summary.total_sales,
            orders: summary.total_orders,
            shift: summary.shifts,
            bestSeller: summary.top_products[0]?.product_name || '-',
            notifications: summary.inventory_statuses.some((i: any) => i.status !== 'normal') ? '1 รายการ' : '-',
        }))

        res.locals.total = count
        res.locals.summaryList = summary
        next()
    } catch (err) {
        next(err)
    }

}


export const getDashboardDetail = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id
        if (isNaN(Number(id))) {
            return next(new ServiceError(DashBoardErrorMaster.ERR_ID_NOT_A_NUMBER))
        }
        const detail = await DailySummaryModel.findOne({
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
            where: { id }
        })

        if (!detail) {
            return next(new ServiceError(DashBoardErrorMaster.ERR_DETAIL_UNDEFINDED))
        }

        res.locals.detail = detail
        next()
    } catch (err) {
        next(err)
    }

}