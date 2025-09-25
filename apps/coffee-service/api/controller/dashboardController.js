"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardDetail = exports.getDashBoardOverview = exports.getDashBoardData = void 0;
const models_1 = require("@coffee/models");
const helpers_1 = require("@coffee/helpers");
const sequelize_1 = require("sequelize");
const helpers_2 = require("@coffee/helpers");
const dashboard_error_json_1 = __importDefault(require("../constants/errors/dashboard.error.json"));
const getDashBoardData = () => async (req, res, next) => {
    try {
        const { start_date: startDate, end_date: endDate, limit, offset } = req.query;
        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return next(new helpers_1.ServiceError(dashboard_error_json_1.default.ERR_DATE_INVALID_FORMAT));
        }
        const where = {
            ...(startDate && endDate && {
                date: {
                    [sequelize_1.Op.between]: [
                        (0, helpers_1.momentAsiaBangkok)(startDate).startOf('day').toISOString(),
                        (0, helpers_1.momentAsiaBangkok)(endDate).endOf('day').toISOString()
                    ]
                }
            })
        };
        const { count, rows } = await models_1.DailySummaryModel.findAndCountAll({
            include: [
                {
                    model: models_1.ShiftTodayModel,
                    as: 'shifts'
                },
                {
                    model: models_1.InventoryStatusModel,
                    as: 'inventory_statuses'
                },
                {
                    model: models_1.TopProductModel,
                    as: 'top_products'
                }
            ],
            where,
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
            order: [['createdAt', 'ASC']],
            distinct: true
        });
        const summary = rows.map((summary) => ({
            id: summary.id,
            date: (0, helpers_2.dayjs)(summary.date).format('DD/MM/YYYY'),
            totalSales: summary.total_sales,
            orders: summary.total_orders,
            shift: summary.shifts,
            bestSeller: summary.top_products[0]?.product_name || '-',
            notifications: summary.inventory_statuses.some((i) => i.status !== 'normal') ? '1 รายการ' : '-',
        }));
        res.locals.total = count;
        res.locals.summaryList = summary;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.getDashBoardData = getDashBoardData;
const getDashBoardOverview = () => async (req, res, next) => {
    try {
        const todayStart = (0, helpers_1.momentAsiaBangkok)().startOf('day').toISOString();
        const todayEnd = (0, helpers_1.momentAsiaBangkok)().endOf('day').toISOString();
        const todayData = await models_1.DailySummaryModel.findOne({
            where: {
                date: {
                    [sequelize_1.Op.between]: [todayStart, todayEnd]
                }
            }
        });
        const yesterdayStart = (0, helpers_1.momentAsiaBangkok)().subtract(1, 'day').startOf('day').toISOString();
        const yesterdayEnd = (0, helpers_1.momentAsiaBangkok)().subtract(1, 'day').endOf('day').toISOString();
        const yesterdayData = await models_1.DailySummaryModel.findOne({
            where: {
                date: {
                    [sequelize_1.Op.between]: [yesterdayStart, yesterdayEnd]
                }
            }
        });
        const monthStart = (0, helpers_1.momentAsiaBangkok)().startOf('month').toISOString();
        const monthEnd = (0, helpers_1.momentAsiaBangkok)().endOf('month').toISOString();
        const monthData = await models_1.DailySummaryModel.findAll({
            where: {
                date: {
                    [sequelize_1.Op.between]: [monthStart, monthEnd]
                }
            }
        });
        const thisMonthSales = monthData.reduce((sum, item) => sum + item.total_sales, 0);
        const allData = await models_1.DailySummaryModel.findAll();
        const allTimeSales = allData.reduce((sum, item) => sum + item.total_sales, 0);
        const allOrderSales = allData.reduce((sum, item) => sum + item.total_orders, 0);
        const weeklySales = allData.map((value) => ({
            date: (0, helpers_2.dayjs)(value.date).format('DD/MM/YYYY'),
            total_sales: value.total_sales
        }));
        const orders = await models_1.OrderModel.findAll();
        const allOrderPending = orders.filter((value) => value.status === 'pending');
        const allOrderComplete = orders.filter((value) => value.status === 'complete');
        const allOrderCancelled = orders.filter((value) => value.status === 'cancelled');
        const topProduct = await models_1.TopProductModel.findAll({
            include: [
                {
                    model: models_1.ProductModel,
                    as: 'product',
                    attributes: ['name', 'price', 'image_url']
                },
            ],
            order: [['total_sold', 'DESC']],
            limit: 3
        });
        const topProductMapping = topProduct.map((value) => ({
            name: value.product.name,
            value: value.total_sold
        }));
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
        };
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.getDashBoardOverview = getDashBoardOverview;
const getDashboardDetail = () => async (req, res, next) => {
    try {
        const id = req.params.id;
        if (isNaN(Number(id))) {
            return next(new helpers_1.ServiceError(dashboard_error_json_1.default.ERR_ID_NOT_A_NUMBER));
        }
        const detail = await models_1.DailySummaryModel.findOne({
            include: [
                {
                    model: models_1.ShiftTodayModel,
                    as: 'shifts'
                },
                {
                    model: models_1.InventoryStatusModel,
                    as: 'inventory_statuses'
                },
                {
                    model: models_1.TopProductModel,
                    as: 'top_products',
                    include: [
                        {
                            model: models_1.ProductModel,
                            as: 'product',
                            attributes: ['id', 'name', 'price', 'image_url']
                        }
                    ]
                }
            ],
            where: { id }
        });
        if (!detail) {
            return next(new helpers_1.ServiceError(dashboard_error_json_1.default.ERR_DETAIL_UNDEFINDED));
        }
        res.locals.detail = detail;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.getDashboardDetail = getDashboardDetail;
//# sourceMappingURL=dashboardController.js.map