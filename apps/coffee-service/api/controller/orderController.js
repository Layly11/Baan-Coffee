"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelOrderStatus = exports.CancelOrder = exports.getTrackOrder = exports.getOrderHistorty = exports.payForQR = exports.createOrder = exports.getPaymentByRefercnce = exports.paymentResult = exports.createPayment = exports.getNotifyOrder = exports.createNotifyOrder = exports.getInvoiceData = exports.updateOrderStatus = exports.getOrderData = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const models_1 = require("@coffee/models");
const sequelize_1 = require("sequelize");
const helpers_1 = require("@coffee/helpers");
const order_error_json_1 = __importDefault(require("../constants/errors/order.error.json"));
const uuid_1 = require("uuid");
const helpers_2 = require("@coffee/helpers");
const getOrderData = () => async (req, res, next) => {
    try {
        const { start_date: startDate, end_date: endDate, status, method, customer_name: customerName, limit, offset } = req.query;
        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return next(new helpers_1.ServiceError(order_error_json_1.default.ERR_DATE_INVALID_FORMAT));
        }
        const where = {
            ...(startDate && endDate && {
                time: {
                    [sequelize_1.Op.between]: [
                        (0, helpers_1.momentAsiaBangkok)(startDate).startOf('day').toISOString(),
                        (0, helpers_1.momentAsiaBangkok)(endDate).endOf('day').toISOString()
                    ]
                }
            }),
            ...(status && { status }),
            ...(method && { payment_method: method }),
        };
        console.log("OffSet: ", offset);
        const { count, rows } = await models_1.OrderModel.findAndCountAll({
            where,
            include: [
                {
                    model: models_1.CustomersModel,
                    as: 'customer',
                    ...(customerName
                        ? { where: { name: { [sequelize_1.Op.like]: `%${customerName}%` } } }
                        : {})
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
        });
        const orders = rows.map((o) => ({
            order_id: o.order_id,
            time: (0, helpers_2.dayjs)(o.time).tz().format('DD/MM/YYYY HH:mm'),
            customer_name: o.customer.name,
            method: o.payment_method,
            total_price: o.total_price,
            status: o.status
        }));
        res.locals.orders = orders;
        res.locals.total = count;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderData = getOrderData;
const updateOrderStatus = () => async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { new_status: newStatus } = req.body;
        console.log("Body: ", req.body);
        const order = await models_1.OrderModel.findOne({ where: { order_id: orderId } });
        if (!order) {
            return next(new helpers_1.ServiceError(order_error_json_1.default.ORDER_NOT_FOUND));
        }
        if (!["pending", "preparing", "out_for_delivery", "complete", "cancelled"].includes(newStatus)) {
            return next(new helpers_1.ServiceError(order_error_json_1.default.STATUS_NOT_FOUND));
        }
        await order.update({ status: newStatus });
        if (newStatus === 'cancelled') {
        }
        if (["complete", "cancelled"].includes(newStatus.toLowerCase())) {
            try {
                await axios_1.default.post('https://baan-coffee-production.up.railway.app/order/notification', { orderId, newStatus });
            }
            catch (err) {
                next(err);
            }
        }
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getInvoiceData = () => async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const order = await models_1.OrderModel.findOne({
            where: { order_id: orderId },
            include: [
                {
                    model: models_1.CustomersModel,
                    as: 'customer',
                },
                {
                    model: models_1.OrderItemModel,
                    as: 'items'
                }
            ],
        });
        if (!order) {
            return next(new helpers_1.ServiceError(order_error_json_1.default.ORDER_NOT_FOUND));
        }
        const invoice = {
            id: order.order_id,
            status: order.status,
            date: order.time,
            customer: {
                name: order.customer?.name,
                email: order.customer?.email,
                phone: order.customer?.phone,
                address: order.shipping_address
            },
            products: order.items?.map((o) => ({
                title: o.name,
                quantity: o.qty,
                price: o.price
            })),
            payment_method: order.payment_method,
            amount: order.total_price,
            shipping_cost: 60.0,
            discount: 0,
        };
        console.log("Invoice: ", invoice);
        res.locals.invoice = invoice;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getInvoiceData = getInvoiceData;
const createNotifyOrder = () => async (req, res, next) => {
    const { orderId, newStatus } = req.body;
    try {
        const validStatuses = ["pending", "preparing", "out_for_delivery", "complete", "cancelled"];
        if (!validStatuses.includes(newStatus)) {
            return next(new helpers_1.ServiceError(order_error_json_1.default.STATUS_NOT_FOUND));
        }
        if (["complete", "cancelled"].includes(newStatus)) {
            const order = await models_1.OrderModel.findOne({ where: { order_id: orderId } });
            if (!order) {
                return next(new helpers_1.ServiceError(order_error_json_1.default.ORDER_NOT_FOUND));
            }
            const customer = await models_1.CustomersModel.findOne({
                where: {
                    id: order.customer_id,
                    isDeleted: false
                }
            });
            if (!customer) {
                return next(new helpers_1.ServiceError(order_error_json_1.default.CUSTOMER_NOT_FOUND));
            }
            await models_1.NotificationModel.create({
                customer_id: customer.id,
                order_id: order.id,
                title: newStatus === 'complete' ? 'Order Complete' : 'Order Cancelled',
                description: newStatus === 'complete'
                    ? `Your order #${orderId} has been completed successfully.`
                    : `Your order #${orderId} has been cancelled.`,
            });
        }
        return next();
    }
    catch (error) {
        next(error);
    }
};
exports.createNotifyOrder = createNotifyOrder;
const getNotifyOrder = () => async (req, res, next) => {
    const customerId = req.user.id;
    try {
        const notify = await models_1.NotificationModel.findAll({
            where: { customer_id: customerId },
            order: [['createdAt', 'DESC']],
        });
        const now = new Date();
        const notification = notify.map((n) => {
            const created = new Date(n.createdAt);
            const diffMs = now.getTime() - created.getTime();
            const diffMinutes = Math.floor(diffMs / 1000 / 60);
            let timeStr = '';
            if (diffMinutes < 60) {
                timeStr = `${diffMinutes}m`;
            }
            else if (diffMinutes < 60 * 24) {
                const hours = Math.floor(diffMinutes / 60);
                timeStr = `${hours}h`;
            }
            else {
                const days = Math.floor(diffMinutes / 60 / 24);
                timeStr = `${days}d`;
            }
            return {
                id: n.id,
                title: n.title,
                desc: n.description,
                time: timeStr,
            };
        });
        res.locals.notification = notification;
        return next();
    }
    catch (err) {
    }
};
exports.getNotifyOrder = getNotifyOrder;
function generateOrderId() {
    const prefix = "ORD";
    const timestamp = Date.now().toString().slice(-8);
    const random = crypto_1.default.randomInt(1000, 9999);
    return `${prefix}${timestamp}${random}`;
}
const createPayment = () => async (req, res, next) => {
    const customerId = req.user.id;
    const { amount, selectedMethod, product, addressId } = req.body;
    const t = await models_1.sequelize.transaction();
    const descriptionProduct = product.map((p) => `${p.name} qty: ${p.amount}`).join(', ');
    try {
        await models_1.TempOrderProductsModel.destroy({
            where: {
                customer_id: customerId,
                expire_at: { [sequelize_1.Op.lt]: new Date() }
            }
        });
        const token = (0, uuid_1.v4)().replace(/-/g, '').slice(0, 12);
        const expireAt = new Date(Date.now() + 10 * 60 * 1000);
        await models_1.TempOrderProductsModel.create({
            token,
            customer_id: customerId,
            products: JSON.stringify(product),
            expire_at: expireAt
        });
        const biller_reference_1 = (0, uuid_1.v4)().replace(/\D/g, "").slice(0, 12);
        const payload = {
            mid: selectedMethod === 'credit' ? process.env.MERCHANT_MID : process.env.MERCHANT_MID_QR,
            order_id: generateOrderId(),
            amount: amount,
            url_redirect: 'https://baan-coffee-production.up.railway.app/order/payment/result',
            url_notify: 'https://baan-coffee-production.up.railway.app/order/payment/result',
            description: descriptionProduct,
            reference_1: String(customerId),
            reference_2: selectedMethod,
            reference_3: token,
            reference_4: String(addressId),
            qrcode: {
                biller_reference_1: biller_reference_1
            }
        };
        const signKey = process.env.SIGN_KEY;
        const hmac = crypto_1.default.createHmac('sha256', Buffer.from(signKey, 'base64'));
        const contentSignature = hmac.update(JSON.stringify(payload)).digest('base64');
        const config = {
            headers: {
                'X-API-ID': process.env.X_API_ID,
                'X-API-KEY': process.env.X_API_KEY,
                'X-Partner-ID': process.env.X_PARTNER_ID,
                'X-Content-Signature': contentSignature
            }
        };
        let response;
        if (selectedMethod === 'credit') {
            try {
                response = await axios_1.default.post('https://octopus-unify-sit.digipay.dev/v2/payment', payload, config);
            }
            catch (err) {
                return next(err);
            }
        }
        else {
            try {
                response = await axios_1.default.post('https://octopus-unify-sit.digipay.dev/v2/payment', payload, config);
            }
            catch (err) {
                return next(err);
            }
        }
        await models_1.PaymentModel.create({
            order_code: payload.order_id,
            customer_id: customerId,
            description: descriptionProduct,
            amount: amount,
            payment_method: selectedMethod,
            status: 'PENDING',
        });
        res.locals.response = response.data;
        return next();
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
};
exports.createPayment = createPayment;
const paymentResult = () => async (req, res, next) => {
    const { order_id, reference_1, reference_2, amount, reference_3, status, process_status, reference, reference_4 } = req.body;
    if (status === "APPROVED") {
        try {
            const axiosRes = await axios_1.default.post('https://baan-coffee-production.up.railway.app/order/create', { order_id, reference_1, reference_2, amount, reference_3, reference, reference_4 });
        }
        catch (err) {
            next(err);
        }
    }
    else {
        if (order_id) {
            const payment = await models_1.PaymentModel.findOne({ where: { order_code: order_id } });
            if (!payment) {
                return next(new helpers_1.ServiceError(order_error_json_1.default.ERR_PAYMENT_NOT_FOUND));
            }
            payment.update({ status: 'CANCELED' });
        }
    }
    res.send(`
    <html>
      <body>
        <script>
          window.ReactNativeWebView.postMessage(JSON.stringify({
            message: "${process_status}",
            reference: "${reference}"
          }));
        </script>
        Redirecting...
      </body>
    </html>
  `);
};
exports.paymentResult = paymentResult;
const getPaymentByRefercnce = () => async (req, res, next) => {
    try {
        const { reference } = req.params;
        const payment = await models_1.PaymentModel.findOne({ where: { reference } });
        res.locals.payment = payment;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getPaymentByRefercnce = getPaymentByRefercnce;
const createOrder = () => async (req, res, next) => {
    try {
        const { order_id, reference_1, reference_2, amount, reference_3, status, reference, reference_4 } = req.body;
        const temp = await models_1.TempOrderProductsModel.findOne({ where: { token: reference_3 } });
        if (!temp)
            return next(new helpers_1.ServiceError(order_error_json_1.default.INVALID_TEMP_TOKEN));
        const products = JSON.parse(temp.products);
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        let summary = await models_1.DailySummaryModel.findOne({
            where: {
                date: {
                    [sequelize_1.Op.between]: [startOfDay, endOfDay]
                }
            },
        });
        if (!summary) {
            const now = new Date();
            const timeString = now.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            });
            summary = await models_1.DailySummaryModel.create({
                date: new Date(),
                total_sales: 0,
                total_orders: 0,
                total_items: 0,
                payments: { qr: 0, credit: 0 },
                first_order_time: timeString,
                last_order_time: timeString
            });
        }
        const payment = await models_1.PaymentModel.findOne({ where: { order_code: order_id } });
        if (!payment) {
            return next(new helpers_1.ServiceError(order_error_json_1.default.ERR_PAYMENT_NOT_FOUND));
        }
        const addresses = await models_1.AddressModel.findByPk(reference_4);
        if (!addresses) {
            return next(new helpers_1.ServiceError(order_error_json_1.default.ERR_PAYMENT_NOT_FOUND));
        }
        const order = await models_1.OrderModel.create({
            summary_id: summary.id,
            order_id: order_id,
            customer_id: Number(reference_1),
            payment_method: reference_2,
            total_price: amount,
            time: new Date(),
            shipping_address: addresses,
            status: "pending",
        });
        if (products.length > 0) {
            await models_1.OrderItemModel.bulkCreate(products.map((product) => ({
                order_id: order.id,
                product_id: product.id,
                image_url: product.image_url,
                name: product.name,
                price: product.price,
                description: product.description,
                qty: product.amount,
                size: product.size
            })));
        }
        await payment.update({ order_id: order.id, status: 'APPROVED', reference });
        const totalItems = products.reduce((acc, i) => acc + i.amount, 0);
        const now = new Date();
        const lastOrderTime = now.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
        summary.total_sales += Number(amount);
        summary.total_orders += 1;
        summary.total_items += Number(totalItems);
        summary.last_order_time = lastOrderTime;
        summary.payments = {
            ...summary.payments,
            [reference_2]: (summary.payments[reference_2] || 0) + Number(amount)
        };
        await summary.save();
        for (const item of products) {
            let topProduct = await models_1.TopProductModel.findOne({
                where: { summary_id: summary.id, product_id: item.id }
            });
            if (!topProduct) {
                topProduct = await models_1.TopProductModel.create({
                    summary_id: summary.id,
                    product_id: item.id,
                    total_sold: item.amount,
                    total_sales: item.price
                });
            }
            else {
                topProduct.total_sold += Number(item.amount);
                topProduct.total_sales += Number(item.price);
                await topProduct.save();
            }
        }
        await models_1.CartModel.destroy({
            where: { customer_id: reference_1 }
        });
        await temp.destroy();
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.createOrder = createOrder;
const payForQR = () => async (req, res, next) => {
    try {
        const { bill_reference_1, amount } = req.body;
        const signKey = process.env.SIGN_KEY;
        const payload = {
            QRId: null,
            QRCode: null,
            BillerNo: null,
            Ref1: bill_reference_1,
            Ref2: "00",
            Amount: Number(amount),
            ResultCode: "000",
            ResultDesc: "Success",
            TransDate: new Date().toISOString(),
            BankRef: (0, uuid_1.v4)()
        };
        const hmac = crypto_1.default.createHmac('sha256', Buffer.from(signKey, 'base64'));
        const contentSignature = hmac.update(JSON.stringify(payload)).digest('base64');
        const config = {
            headers: {
                'X-API-ID': process.env.X_API_ID,
                'X-API-KEY': process.env.X_API_KEY,
                'X-Partner-ID': process.env.X_PARTNER_ID,
                'X-Content-Signature': contentSignature
            }
        };
        const payment = await axios_1.default.post('https://octopus-unify-sit.digipay.dev/api/v1/notify/test/qr', payload, config);
        res.locals.payment = payment.data;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.payForQR = payForQR;
const getOrderHistorty = () => async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const orders = await models_1.OrderModel.findAll({
            where: { customer_id: customerId },
            include: [
                {
                    model: models_1.OrderItemModel,
                    as: "items",
                    include: [
                        {
                            model: models_1.ProductModel,
                            as: 'product'
                        }
                    ]
                },
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: models_1.OrderItemModel, as: 'items' }, 'id', 'ASC']
            ],
        });
        const orderHistory = orders.flatMap((o) => o.items.map((item) => ({
            id: item.id,
            orderID: o.order_id,
            name: item.name,
            size: item.size,
            description: item.description || "",
            price: Number(item.price).toFixed(2),
            time: new Date(o.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }),
            imageSource: item.image_url
        })));
        orderHistory.sort((a, b) => b.id - a.id);
        res.locals.orderHistory = orderHistory;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getOrderHistorty = getOrderHistorty;
const getTrackOrder = () => async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { orderId } = req.query;
        const whereCondition = { customer_id: customerId };
        if (orderId && orderId !== "undefined" && orderId !== "null") {
            whereCondition.order_id = orderId;
        }
        const latestOrder = await models_1.OrderModel.findOne({
            where: whereCondition,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: models_1.OrderItemModel,
                    as: 'items',
                    include: [
                        {
                            model: models_1.ProductModel,
                            as: 'product'
                        }
                    ]
                }
            ]
        });
        if (!latestOrder) {
            res.locals.latestOrder = null;
            return next();
        }
        const orderPlain = latestOrder.get({ plain: true });
        const mappedLastOrder = {
            ...orderPlain,
            time: latestOrder?.time
                ? new Date(latestOrder.time).toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: 'Asia/Bangkok',
                })
                : undefined,
        };
        res.locals.latestOrder = mappedLastOrder;
        return next();
    }
    catch (err) {
        next(err);
    }
};
exports.getTrackOrder = getTrackOrder;
const CancelOrder = () => async (req, res, next) => {
    const t = await models_1.sequelize.transaction();
    try {
        const { order_id } = req.body;
        console.log("Body: ", req.body);
        const payment = await models_1.PaymentModel.findOne({ where: { order_code: order_id }, transaction: t });
        const order = await models_1.OrderModel.findOne({ where: { order_id }, include: [{ model: models_1.OrderItemModel, as: 'items' }], transaction: t });
        if (!payment) {
            await t.rollback();
            return next(new helpers_1.ServiceError(order_error_json_1.default.ERR_PAYMENT_NOT_FOUND));
        }
        if (!order) {
            await t.rollback();
            return next(new helpers_1.ServiceError(order_error_json_1.default.ORDER_NOT_FOUND));
        }
        const config = {
            headers: {
                'X-API-ID': process.env.X_API_ID,
                'X-API-KEY': process.env.X_API_KEY,
                'X-Partner-ID': process.env.X_PARTNER_ID
            }
        };
        const paymentInquiry = await axios_1.default.get(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}`, config);
        if (paymentInquiry.data.transaction.status === 'APPROVED') {
            await axios_1.default.post(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}/void`, {
                reason: "Return an item"
            }, config);
            await payment.update({ status: 'VOIDED' }, { transaction: t });
        }
        else if (paymentInquiry.data.transaction.status === 'SETTLED' || paymentInquiry.data.transaction.status === 'PRE-SETTLED') {
            await axios_1.default.post(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}/refund`, {
                reason: "Return an item",
                refund_id: (0, uuid_1.v4)()
            }, config);
            await payment.update({ status: 'REFUNDED' }, { transaction: t });
        }
        if (order.summary_id) {
            const summary = await models_1.DailySummaryModel.findByPk(order.summary_id, { transaction: t });
            if (summary && order.items) {
                const totalItems = order.items.reduce((acc, i) => acc + i.qty, 0);
                summary.total_sales -= Number(order.total_price);
                summary.total_orders -= 1;
                summary.total_items -= Number(totalItems);
                if (summary.total_sales < 0)
                    summary.total_sales = 0;
                if (summary.total_orders < 0)
                    summary.total_orders = 0;
                if (summary.total_items < 0)
                    summary.total_items = 0;
                summary.payments = {
                    ...summary.payments,
                    [order.payment_method]: (summary.payments[order.payment_method] || 0) - Number(order.total_price)
                };
                if (summary.payments[order.payment_method] < 0) {
                    summary.payments[order.payment_method] = 0;
                }
                await summary.save({ transaction: t });
                for (const item of order.items) {
                    const topProduct = await models_1.TopProductModel.findOne({
                        where: { summary_id: summary.id, product_id: item.product_id },
                        transaction: t
                    });
                    if (topProduct) {
                        topProduct.total_sold -= Number(item.qty);
                        topProduct.total_sales -= Number(item.price);
                        if (topProduct.total_sold < 0)
                            topProduct.total_sold = 0;
                        if (topProduct.total_sales < 0)
                            topProduct.total_sales = 0;
                        await topProduct.save({ transaction: t });
                    }
                }
            }
        }
        await order.update({ status: 'cancelled' }, { transaction: t });
        await t.commit();
        return next();
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
};
exports.CancelOrder = CancelOrder;
const CancelOrderStatus = () => async (req, res, next) => {
    const t = await models_1.sequelize.transaction();
    try {
        const { order_id } = req.body;
        console.log("Body: ", req.body);
        const payment = await models_1.PaymentModel.findOne({ where: { order_code: order_id }, transaction: t });
        const order = await models_1.OrderModel.findOne({ where: { order_id }, include: [{ model: models_1.OrderItemModel, as: 'items' }], transaction: t });
        if (!payment) {
            await t.rollback();
            return next(new helpers_1.ServiceError(order_error_json_1.default.ERR_PAYMENT_NOT_FOUND));
        }
        if (!order) {
            await t.rollback();
            return next(new helpers_1.ServiceError(order_error_json_1.default.ORDER_NOT_FOUND));
        }
        const config = {
            headers: {
                'X-API-ID': process.env.X_API_ID,
                'X-API-KEY': process.env.X_API_KEY,
                'X-Partner-ID': process.env.X_PARTNER_ID
            }
        };
        const paymentInquiry = await axios_1.default.get(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}`, config);
        if (paymentInquiry.data.transaction.status === 'APPROVED') {
            await axios_1.default.post(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}/void`, {
                reason: "Return an item"
            }, config);
            await payment.update({ status: 'VOIDED' }, { transaction: t });
        }
        else if (paymentInquiry.data.transaction.status === 'SETTLED' || paymentInquiry.data.transaction.status === 'PRE-SETTLED') {
            await axios_1.default.post(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}/refund`, {
                reason: "Return an item",
                refund_id: (0, uuid_1.v4)()
            }, config);
            await payment.update({ status: 'REFUNDED' }, { transaction: t });
        }
        if (order.summary_id) {
            const summary = await models_1.DailySummaryModel.findByPk(order.summary_id, { transaction: t });
            if (summary && order.items) {
                const totalItems = order.items.reduce((acc, i) => acc + i.qty, 0);
                summary.total_sales -= Number(order.total_price);
                summary.total_orders -= 1;
                summary.total_items -= Number(totalItems);
                if (summary.total_sales < 0)
                    summary.total_sales = 0;
                if (summary.total_orders < 0)
                    summary.total_orders = 0;
                if (summary.total_items < 0)
                    summary.total_items = 0;
                summary.payments = {
                    ...summary.payments,
                    [order.payment_method]: (summary.payments[order.payment_method] || 0) - Number(order.total_price)
                };
                if (summary.payments[order.payment_method] < 0) {
                    summary.payments[order.payment_method] = 0;
                }
                await summary.save({ transaction: t });
                for (const item of order.items) {
                    const topProduct = await models_1.TopProductModel.findOne({
                        where: { summary_id: summary.id, product_id: item.product_id },
                        transaction: t
                    });
                    if (topProduct) {
                        topProduct.total_sold -= Number(item.qty);
                        topProduct.total_sales -= Number(item.price);
                        if (topProduct.total_sold < 0)
                            topProduct.total_sold = 0;
                        if (topProduct.total_sales < 0)
                            topProduct.total_sales = 0;
                        await topProduct.save({ transaction: t });
                    }
                }
            }
        }
        await order.update({ status: 'cancelled' }, { transaction: t });
        await t.commit();
        return next();
    }
    catch (err) {
        await t.rollback();
        next(err);
    }
};
exports.CancelOrderStatus = CancelOrderStatus;
//# sourceMappingURL=orderController.js.map