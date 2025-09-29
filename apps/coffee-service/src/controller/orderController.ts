import { NextFunction, Request, Response } from "express";
import crypto from 'crypto'
import axios from 'axios'
import { OrderModel, sequelize, DailySummaryModel, CartModel, TopProductModel, PaymentModel, TempOrderProductsModel, OrderItemModel, ProductModel, AddressModel, CustomersModel, NotificationModel } from "@coffee/models";
import { Op, or } from "sequelize";
import { momentAsiaBangkok, ServiceError } from "@coffee/helpers";
import OrderErrorMaster from '../constants/errors/order.error.json'
import { v4 as uuidv4 } from "uuid";
import { dayjs } from "@coffee/helpers";
import { error } from "console";

export const getOrderData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { start_date: startDate, end_date: endDate, status, method, customer_name: customerName, limit, offset } = req.query as any

        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return next(new ServiceError(OrderErrorMaster.ERR_DATE_INVALID_FORMAT))
        }

        const where = {
            ...(startDate && endDate && {
                time: {
                    [Op.between]: [
                        momentAsiaBangkok(startDate).startOf('day').toISOString(),
                        momentAsiaBangkok(endDate).endOf('day').toISOString()
                    ]
                }
            }),
            ...(status && { status }),
            ...(method && { payment_method: method }),
        }

        console.log("OffSet: ",offset)
        const {count, rows} = await OrderModel.findAndCountAll({
            where,
            include: [
                {
                    model: CustomersModel,
                    as: 'customer',
                    ...(customerName
                        ? { where: { name: { [Op.like]: `%${customerName}%` } } }
                        : {}
                    )
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: Number(limit) || 10,
            offset: Number(offset) || 0,
        })



        const orders = rows.map((o: any) => (
            {
                order_id: o.order_id,
                time: dayjs(o.time).format('DD/MM/YYYY HH:MM'),
                customer_name: o.customer.name,
                method: o.payment_method,
                total_price: o.total_price,
                status: o.status
            }
        ))

        res.locals.orders = orders
        res.locals.total = count
        return next()
    } catch (err) {
        next(err)
    }
}



export const updateOrderStatus = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id
        const { new_status: newStatus } = req.body
        console.log("Body: " ,req.body)
        const order = await OrderModel.findOne({ where: { order_id: orderId } })

        if (!order) {
            return next(new ServiceError(OrderErrorMaster.ORDER_NOT_FOUND))
        }
        if (!["pending", "preparing", "out_for_delivery", "complete", "cancelled"].includes(newStatus)) {
            return next(new ServiceError(OrderErrorMaster.STATUS_NOT_FOUND))
        }
        await order.update({ status: newStatus })

        if(newStatus === 'cancelled') {
            
        }
        if (["complete", "cancelled"].includes(newStatus.toLowerCase())) {
            try {
                await axios.post('https://baan-coffee-production.up.railway.app/order/notification', { orderId, newStatus })
            } catch (err) {
                next(err)
            }
        }

        return next()
    } catch (err) {
        next(err)
    }
}


export const getInvoiceData = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id

        const order = await OrderModel.findOne({
            where: { order_id: orderId },
            include: [
                {
                    model: CustomersModel,
                    as: 'customer',
                },
                {
                    model: OrderItemModel,
                    as: 'items'
                }
            ],
        },)

        if (!order) {
            return next(new ServiceError(OrderErrorMaster.ORDER_NOT_FOUND))
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
            products: order.items?.map((o: any) => ({
                title: o.name,
                quantity: o.qty,
                price: o.price
            })),
            payment_method: order.payment_method,
            amount: order.total_price,
            shipping_cost: 60.0,
            discount: 0,
        }

        console.log("Invoice: ", invoice)

        res.locals.invoice = invoice
        return next()
    } catch (err) {
        next(err)
    }
}

export const createNotifyOrder = () => async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, newStatus } = req.body;

    try {
        const validStatuses = ["pending", "preparing", "out_for_delivery", "complete", "cancelled"];
        if (!validStatuses.includes(newStatus)) {
            return next(new ServiceError(OrderErrorMaster.STATUS_NOT_FOUND));
        }

        if (["complete", "cancelled"].includes(newStatus)) {
            const order = await OrderModel.findOne({ where: { order_id: orderId } });
            if (!order) {
                return next(new ServiceError(OrderErrorMaster.ORDER_NOT_FOUND));
            }

            const customer = await CustomersModel.findOne({
                where: {
                    id: order.customer_id,
                    isDeleted: false
                }
            });
            if (!customer) {
                return next(new ServiceError(OrderErrorMaster.CUSTOMER_NOT_FOUND));
            }

            await NotificationModel.create({
                customer_id: customer.id,
                order_id: order.id,
                title: newStatus === 'complete' ? 'Order Complete' : 'Order Cancelled',
                description:
                    newStatus === 'complete'
                        ? `Your order #${orderId} has been completed successfully.`
                        : `Your order #${orderId} has been cancelled.`,
            });
        }

        return next();
    } catch (error) {
        next(error);
    }
};

export const getNotifyOrder = () => async (req: Request, res: Response, next: NextFunction) => {
    const customerId = (req.user as any).id
    try {
        const notify = await NotificationModel.findAll({
            where: {customer_id: customerId},
            order: [['createdAt', 'DESC']],
        })

        const now = new Date();

        const notification = notify.map((n: any) => {
            const created = new Date(n.createdAt);
            const diffMs = now.getTime() - created.getTime();
            const diffMinutes = Math.floor(diffMs / 1000 / 60);

            let timeStr = '';
            if (diffMinutes < 60) {
                timeStr = `${diffMinutes}m`;
            } else if (diffMinutes < 60 * 24) {
                const hours = Math.floor(diffMinutes / 60);
                timeStr = `${hours}h`;
            } else {
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

        res.locals.notification = notification

        return next()
    } catch(err) {

    }
}





///////////////////////Mobile/////////////////////////////


function generateOrderId() {
    const prefix = "ORD";
    const timestamp = Date.now().toString().slice(-8);
    const random = crypto.randomInt(1000, 9999);
    return `${prefix}${timestamp}${random}`;
}

export const createPayment = () => async (req: Request, res: Response, next: NextFunction) => {
    const customerId = (req.user as any).id as any
    const { amount, selectedMethod, product, addressId } = req.body
    const t = await sequelize.transaction();

    const descriptionProduct = product.map((p: any) => `${p.name} qty: ${p.amount}`).join(', ')
    try {

        await TempOrderProductsModel.destroy({
            where: {
                customer_id: customerId,
                expire_at: { [Op.lt]: new Date() }
            }
        });
        const token = uuidv4().replace(/-/g, '').slice(0, 12);

        const expireAt = new Date(Date.now() + 10 * 60 * 1000);

        await TempOrderProductsModel.create({
            token,
            customer_id: customerId,
            products: JSON.stringify(product),
            expire_at: expireAt
        });

        const biller_reference_1 = uuidv4().replace(/\D/g, "").slice(0, 12);
        const payload = {
            mid: selectedMethod === 'credit' ? process.env.MERCHANT_MID : process.env.MERCHANT_MID_QR,
            order_id: generateOrderId(),
            amount: parseFloat(amount),
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
        }

        const signKey = process.env.SIGN_KEY!
        const hmac = crypto.createHmac('sha256', Buffer.from(signKey, 'base64'))
        const contentSignature = hmac.update(JSON.stringify(payload)).digest('base64')

        const config = {
            headers: {
                'X-API-ID': process.env.X_API_ID,
                'X-API-KEY': process.env.X_API_KEY,
                'X-Partner-ID': process.env.X_PARTNER_ID,
                'X-Content-Signature': contentSignature
            }
        }

        let response
        if (selectedMethod === 'credit') {
            try{
                response = await axios.post('https://octopus-unify-sit.digipay.dev/v2/payment', payload, config)
            }
            catch (err) {
                return next(err)
            }
    
        } else {
            try {
                response = await axios.post('https://octopus-unify-sit.digipay.dev/v2/payment', payload, config)
            } catch (err) {
                return next(err)
            }
        }

        await PaymentModel.create(
            {
                order_code: payload.order_id,
                customer_id: customerId,
                description: descriptionProduct,
                amount: amount,
                payment_method: selectedMethod,
                status: 'PENDING',
            }
        )
        res.locals.response = response.data

        return next()

    } catch (err) {
        await t.rollback();
        next(err)
    }
}


export const paymentResult = () => async (req: Request, res: Response, next: NextFunction) => {
    const { order_id, reference_1, reference_2, amount, reference_3, status, process_status, reference, reference_4 } = req.body
    if (status === "APPROVED" || process_status === 'true') {
        try {
            const axiosRes = await axios.post('https://baan-coffee-production.up.railway.app/order/create', { order_id, reference_1, reference_2, amount, reference_3, reference, reference_4 })
        } catch (err) {
            next(err)
        }
    } else {
        const payment = await PaymentModel.findOne({ where: { order_code: order_id } })
        if (!payment) {
            return next(new ServiceError(OrderErrorMaster.ERR_PAYMENT_NOT_FOUND))
        }

        payment.update({ status: 'CANCELED' })
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
}

export const getPaymentByRefercnce = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reference } = req.params

        const payment = await PaymentModel.findOne({ where: { reference } })

        res.locals.payment = payment

        return next()
    } catch (err) {
        next(err)
    }
}

export const createOrder = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { order_id, reference_1, reference_2, amount, reference_3, status, reference, reference_4 } = req.body

        console.log("token: ", reference_3)
        const temp = await TempOrderProductsModel.findOne({ where: { token: reference_3 } });
        if (!temp) return next(new ServiceError(OrderErrorMaster.INVALID_TEMP_TOKEN));

        const products = JSON.parse(temp.products);
        const today = new Date()
        const startOfDay = new Date(today.setHours(0, 0, 0, 0))
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        let summary = await DailySummaryModel.findOne({
            where: {
                date: {
                    [Op.between]: [startOfDay, endOfDay]
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
            summary = await DailySummaryModel.create(
                {
                    date: new Date(),
                    total_sales: 0,
                    total_orders: 0,
                    total_items: 0,
                    payments: { qr: 0, credit: 0 },
                    first_order_time: timeString,
                    last_order_time: timeString
                }
            )
        }
        const payment = await PaymentModel.findOne({ where: { order_code: order_id } })

        if (!payment) {
            return next(new ServiceError(OrderErrorMaster.ERR_PAYMENT_NOT_FOUND))
        }


        const addresses = await AddressModel.findByPk(reference_4)

        if (!addresses) {
            return next(new ServiceError(OrderErrorMaster.ERR_PAYMENT_NOT_FOUND))
        }
        const order = await OrderModel.create(
            {
                summary_id: summary.id,
                order_id: order_id,
                customer_id: Number(reference_1),
                payment_method: reference_2,
                total_price: amount,
                time: new Date(),
                shipping_address: addresses,
                status: "pending",
            }
        )

        if (products.length > 0) {
            await OrderItemModel.bulkCreate(
                products.map((product: any) => ({
                    order_id: order.id,
                    product_id: product.id,
                    image_url: product.image_url,
                    name: product.name,
                    price: product.price,
                    description: product.description,
                    qty: product.amount,
                    size: product.size
                }))
            );
        }

        await payment.update({ order_id: order.id, status: 'APPROVED', reference })

        const totalItems = products.reduce((acc: any, i: any) => acc + i.amount, 0);
        const now = new Date();
        const lastOrderTime = now.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
        summary.total_sales += Number(amount)
        summary.total_orders += 1;
        summary.total_items += Number(totalItems);
        summary.last_order_time = lastOrderTime
        summary.payments = {
            ...summary.payments,
            [reference_2 as keyof typeof summary.payments]: (summary.payments[reference_2 as keyof typeof summary.payments] || 0) + Number(amount)
        };
        await summary.save();


        for (const item of products) {
            let topProduct = await TopProductModel.findOne({
                where: { summary_id: summary.id, product_id: item.id }
            })


            if (!topProduct) {
                topProduct = await TopProductModel.create(
                    {
                        summary_id: summary.id,
                        product_id: item.id,
                        total_sold: item.amount,
                        total_sales: item.price
                    }
                )
            } else {
                topProduct.total_sold += Number(item.amount)
                topProduct.total_sales += Number(item.price)
                await topProduct.save();
            }
        }


        await CartModel.destroy({
            where: { customer_id: reference_1 }
        })

        await temp.destroy();

        return next()
    } catch (err) {
        next(err)
    }
}

export const payForQR = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bill_reference_1, amount } = req.body
        const signKey = process.env.SIGN_KEY!
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
            BankRef: uuidv4()
        }
        const hmac = crypto.createHmac('sha256', Buffer.from(signKey, 'base64'))
        const contentSignature = hmac.update(JSON.stringify(payload)).digest('base64')


        const config = {
            headers: {
                'X-API-ID': process.env.X_API_ID,
                'X-API-KEY': process.env.X_API_KEY,
                'X-Partner-ID': process.env.X_PARTNER_ID,
                'X-Content-Signature': contentSignature
            }
        }

        const payment = await axios.post('https://octopus-unify-sit.digipay.dev/api/v1/notify/test/qr', payload, config)

        res.locals.payment = payment.data
        return next()
    } catch (err) {
        next(err)
    }
}



export const getOrderHistorty = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req.user as any).id

        const orders = await OrderModel.findAll({
            where: { customer_id: customerId },
            include: [
                {
                    model: OrderItemModel,
                    as: "items",
                    include: [
                        {
                            model: ProductModel,
                            as: 'product'
                        }
                    ]
                },
            ],
            order: [
                ['createdAt', 'DESC'],
                [{ model: OrderItemModel, as: 'items' }, 'id', 'ASC']
            ],
        });


        const orderHistory = orders.flatMap((o: any) =>
            o.items.map((item: any) => ({
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

            }))
        );

        orderHistory.sort((a, b) => b.id - a.id);

        res.locals.orderHistory = orderHistory

        return next()


    } catch (err) {
        next(err)
    }
}


export const getTrackOrder = () => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req.user as any).id
        const { orderId } = req.query;

        const whereCondition: any = { customer_id: customerId };
        if (orderId && orderId !== "undefined" && orderId !== "null") {
            whereCondition.order_id = orderId;
        }


        const latestOrder = await OrderModel.findOne({
            where: whereCondition,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: OrderItemModel,
                    as: 'items',
                    include: [
                        {
                            model: ProductModel,
                            as: 'product'
                        }
                    ]
                }
            ]
        })

        if (!latestOrder) {
            res.locals.latestOrder = null;
            return next();
        }

        const orderPlain = latestOrder.get({ plain: true });

        const mappedLastOrder = {
            ...orderPlain,
            time: latestOrder?.time
                ? new Date(latestOrder.time).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                })
                : undefined,
        }


        res.locals.latestOrder = mappedLastOrder;

        return next();
    } catch (err) {
        next(err)
    }
}


export const CancelOrder = () => async (req: Request, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
        const { order_id } = req.body

        console.log("Body: ", req.body)
        const payment = await PaymentModel.findOne({ where: { order_code: order_id }, transaction: t })
        const order = await OrderModel.findOne({ where: { order_id }, include: [{ model: OrderItemModel, as: 'items' }], transaction: t })

        if (!payment) {
            await t.rollback();
            return next(new ServiceError(OrderErrorMaster.ERR_PAYMENT_NOT_FOUND))
        }
        if (!order) {
            await t.rollback();
            return next(new ServiceError(OrderErrorMaster.ORDER_NOT_FOUND))
        }

        const config = {
            headers: {
                'X-API-ID': process.env.X_API_ID,
                'X-API-KEY': process.env.X_API_KEY,
                'X-Partner-ID': process.env.X_PARTNER_ID
            }
        }

        const paymentInquiry = await axios.get(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}`, config)

        if (paymentInquiry.data.transaction.status === 'APPROVED') {
            await axios.post(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}/void`, {
                reason: "Return an item"
            }, config)

            await payment.update({ status: 'VOIDED' }, { transaction: t })

        } else if (paymentInquiry.data.transaction.status === 'SETTLED' || paymentInquiry.data.transaction.status === 'PRE-SETTLED') {
            await axios.post(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}/refund`, {
                reason: "Return an item",
                refund_id: uuidv4()
            }, config)
            await payment.update({ status: 'REFUNDED' }, { transaction: t })
        }

        if (order.summary_id) {
            const summary = await DailySummaryModel.findByPk(order.summary_id, { transaction: t })

            if (summary && order.items) {
                const totalItems = order.items.reduce((acc: number, i: any) => acc + i.qty, 0)

                summary.total_sales -= Number(order.total_price)
                summary.total_orders -= 1;
                summary.total_items -= Number(totalItems)

                if (summary.total_sales < 0) summary.total_sales = 0;
                if (summary.total_orders < 0) summary.total_orders = 0;
                if (summary.total_items < 0) summary.total_items = 0;

                summary.payments = {
                    ...summary.payments,
                    [order.payment_method as keyof typeof summary.payments]:
                        (summary.payments[order.payment_method as keyof typeof summary.payments] || 0) - Number(order.total_price)
                };


                if (summary.payments[order.payment_method as keyof typeof summary.payments] < 0) {
                    summary.payments[order.payment_method as keyof typeof summary.payments] = 0;
                }

                await summary.save({ transaction: t });

                for (const item of order.items) {
                    const topProduct = await TopProductModel.findOne({
                        where: { summary_id: summary.id, product_id: item.product_id },
                        transaction: t
                    });

                    if (topProduct) {
                        topProduct.total_sold -= Number(item.qty);
                        topProduct.total_sales -= Number(item.price);
                        if (topProduct.total_sold < 0) topProduct.total_sold = 0;
                        if (topProduct.total_sales < 0) topProduct.total_sales = 0;

                        await topProduct.save({ transaction: t });
                    }
                }
            }
        }

        await order.update({ status: 'cancelled' }, { transaction: t })

        await t.commit();
        return next()
    } catch (err) {
        await t.rollback();
        next(err)
    }
}


export const CancelOrderStatus = () => async (req: Request, res: Response, next: NextFunction) => {
    const t = await sequelize.transaction();
    try {
        const { order_id } = req.body

        console.log("Body: ", req.body)
        const payment = await PaymentModel.findOne({ where: { order_code: order_id }, transaction: t })
        const order = await OrderModel.findOne({ where: { order_id }, include: [{ model: OrderItemModel, as: 'items' }], transaction: t })

        if (!payment) {
            await t.rollback();
            return next(new ServiceError(OrderErrorMaster.ERR_PAYMENT_NOT_FOUND))
        }
        if (!order) {
            await t.rollback();
            return next(new ServiceError(OrderErrorMaster.ORDER_NOT_FOUND))
        }

        const config = {
            headers: {
                'X-API-ID': process.env.X_API_ID,
                'X-API-KEY': process.env.X_API_KEY,
                'X-Partner-ID': process.env.X_PARTNER_ID
            }
        }

        const paymentInquiry = await axios.get(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}`, config)

        if (paymentInquiry.data.transaction.status === 'APPROVED') {
            await axios.post(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}/void`, {
                reason: "Return an item"
            }, config)

            await payment.update({ status: 'VOIDED' }, { transaction: t })

        } else if (paymentInquiry.data.transaction.status === 'SETTLED' || paymentInquiry.data.transaction.status === 'PRE-SETTLED') {
            await axios.post(`https://octopus-unify-sit.digipay.dev/v2/transaction/${payment.reference}/refund`, {
                reason: "Return an item",
                refund_id: uuidv4()
            }, config)
            await payment.update({ status: 'REFUNDED' }, { transaction: t })
        }

        if (order.summary_id) {
            const summary = await DailySummaryModel.findByPk(order.summary_id, { transaction: t })

            if (summary && order.items) {
                const totalItems = order.items.reduce((acc: number, i: any) => acc + i.qty, 0)

                summary.total_sales -= Number(order.total_price)
                summary.total_orders -= 1;
                summary.total_items -= Number(totalItems)

                if (summary.total_sales < 0) summary.total_sales = 0;
                if (summary.total_orders < 0) summary.total_orders = 0;
                if (summary.total_items < 0) summary.total_items = 0;

                summary.payments = {
                    ...summary.payments,
                    [order.payment_method as keyof typeof summary.payments]:
                        (summary.payments[order.payment_method as keyof typeof summary.payments] || 0) - Number(order.total_price)
                };


                if (summary.payments[order.payment_method as keyof typeof summary.payments] < 0) {
                    summary.payments[order.payment_method as keyof typeof summary.payments] = 0;
                }

                await summary.save({ transaction: t });

                for (const item of order.items) {
                    const topProduct = await TopProductModel.findOne({
                        where: { summary_id: summary.id, product_id: item.product_id },
                        transaction: t
                    });

                    if (topProduct) {
                        topProduct.total_sold -= Number(item.qty);
                        topProduct.total_sales -= Number(item.price);
                        if (topProduct.total_sold < 0) topProduct.total_sold = 0;
                        if (topProduct.total_sales < 0) topProduct.total_sales = 0;

                        await topProduct.save({ transaction: t });
                    }
                }
            }
        }

        await order.update({ status: 'cancelled' }, { transaction: t })

        await t.commit();
        return next()
    } catch (err) {
        await t.rollback();
        next(err)
    }
}
