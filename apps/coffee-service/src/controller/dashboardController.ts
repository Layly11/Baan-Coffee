import { NextFunction, Request, Response } from "express";
import { DailySummaryModel, InventoryStatusModel, OrderModel, ProductModel, ShiftTodayModel, TopProductModel } from '@coffee/models'
import { momentAsiaBangkok, ServiceError } from "@coffee/helpers";
import { Op } from 'sequelize'
import { dayjs } from "@coffee/helpers";
import DashBoardErrorMaster from '../constants/errors/dashboard.error.json'
import { AuditLogActionType, AuditLogMenuType, CreateAuditLog } from "../constants/commons/createAuditLog";

export const getDashBoardData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            audit_action: auditAction,
            start_date: startDate,
            end_date: endDate,
            limit,
            offset } = req.query as any

        const portal = req.user as any

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
                    as: 'top_products',
                    include: [
                        {
                            model: ProductModel,
                            as: 'product',
                        }
                    ]
                }
            ],
            where,
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
            order: [['createdAt', 'ASC']],
            distinct: true
        })


        const summary = rows.map((summary: any) => {
            const topProducts = summary.top_products || []

            const bestSellerProduct = topProducts.reduce((best: any, current: any) => {
                if (!best) return current
                return (current.total_sold || 0) > (best.total_sold || 0) ? current : best
            }, null)

            return {
                id: summary.id,
                date: dayjs(summary.date).format('DD/MM/YYYY'),
                totalSales: summary.total_sales,
                orders: summary.total_orders,
                bestSeller: bestSellerProduct?.product?.name || '-',
                bestSellerQuantity: bestSellerProduct?.total_sold || 0
            }
        })

        if (auditAction) {
            res.locals.audit = CreateAuditLog({
                menu: AuditLogMenuType.DASHBOARD,
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
            })
        }

        res.locals.total = count
        res.locals.summaryList = summary
        next()
    } catch (err) {
        next(err)
    }

}

export const getDashBoardOverview = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const todayStart = momentAsiaBangkok().startOf('day').toISOString()
        const todayEnd = momentAsiaBangkok().endOf('day').toISOString()

        const todayData = await DailySummaryModel.findOne({
            where: {
                date: {
                    [Op.between]: [todayStart, todayEnd]
                }
            }
        })

        const yesterdayStart = momentAsiaBangkok().subtract(1, 'day').startOf('day').toISOString()
        const yesterdayEnd = momentAsiaBangkok().subtract(1, 'day').endOf('day').toISOString()

        const yesterdayData = await DailySummaryModel.findOne({
            where: {
                date: {
                    [Op.between]: [yesterdayStart, yesterdayEnd]
                }
            }
        })

        const monthStart = momentAsiaBangkok().startOf('month').toISOString()
        const monthEnd = momentAsiaBangkok().endOf('month').toISOString()

        const monthData = await DailySummaryModel.findAll({
            where: {
                date: {
                    [Op.between]: [monthStart, monthEnd]
                }
            }
        })

        const thisMonthSales = monthData.reduce((sum, item) => sum + item.total_sales, 0)

        const allData = await DailySummaryModel.findAll()

        const allTimeSales = allData.reduce((sum, item) => sum + item.total_sales, 0)
        const allOrderSales = allData.reduce((sum, item) => sum + item.total_orders, 0)
        const weeklySales = allData.map((value) => ({
            date: dayjs(value.date).format('DD/MM/YYYY'),
            total_sales: value.total_sales
        }))

        const orders = await OrderModel.findAll()
        const allOrderPending = orders.filter((value) => value.status === 'pending')
        const allOrderComplete = orders.filter((value) => value.status === 'complete')
        const allOrderCancelled = orders.filter((value) => value.status === 'cancelled')

        const topProduct = await TopProductModel.findAll({
            include: [
                {
                    model: ProductModel,
                    as: 'product',
                    attributes: ['name', 'price', 'image_url']
                },
            ],
            order: [['total_sold', 'DESC']],
            limit: 3
        })

        const topProductMapping = topProduct.map((value: any) => ({
            name: value.product.name,
            value: value.total_sold
        }))


        res.locals.overview = {
            todayOrders: {
                todaySales: todayData?.total_sales,
                payments: todayData?.payments
            },
            yesterdayOrders: {
                yesterdaySales: yesterdayData?.total_sales,
                payments: yesterdayData?.payments
            },
            thisMonthSales,
            allData: {
                allTimeSales,
                allOrderSales,
                allOrderPending,
                allOrderComplete,
                allOrderCancelled
            },
            weeklySales,
            topProductMapping

        }
        next()

    } catch (err) {
        next(err)
    }
}


export const getDashboardDetail = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id
        const portal = req.user as any

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
                    as: 'top_products',
                    include: [
                        {
                            model: ProductModel,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'image_url']
                        }
                    ]
                }
            ],
            where: { id }
        })

        if (!detail) {
            return next(new ServiceError(DashBoardErrorMaster.ERR_DETAIL_UNDEFINDED))
        }

        res.locals.audit = CreateAuditLog(
            {
                menu: AuditLogMenuType.DASHBOARD,
                action: AuditLogActionType.VIEW_DASHBOARD_DETAILS,
                editorName: portal.username,
                editorRole: portal.role.name,
                eventDateTime: new Date(),
                staffId: portal.id,
                staffEmail: portal.email,
                channel: (req.headers['x-original-forwarded-for'] as string)?.split(',')[0].split(':')[0] || req.ip!,
                searchCriteria: undefined,
                previousValues: undefined,
                newValues: undefined,
                recordKeyValues: undefined,
                isPii: true
            }
        )

        res.locals.detail = detail
        next()
    } catch (err) {
        next(err)
    }

}