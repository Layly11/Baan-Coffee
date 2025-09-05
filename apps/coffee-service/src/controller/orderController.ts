import { NextFunction, Request, Response } from "express";
import crypto from 'crypto'
import axios from 'axios'
import { OrderModel, sequelize, DailySummaryModel, CartModel, TopProductModel, PaymentModel, TempOrderProductsModel, OrderItemModel, ProductModel, AddressModel } from "@coffee/models";
import { Op, or } from "sequelize";
import { ServiceError } from "@coffee/helpers";
import OrderErrorMaster from '../constants/errors/oreder.error.json'
import { v4 as uuidv4 } from "uuid";


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
    console.log("Product: ", product)

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
            amount,
            url_redirect: 'http://127.0.0.1:9302/order/payment/result',
            url_notify: 'http://127.0.0.1:9302/order/payment/result',
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
            response = await axios.post('http://127.0.0.1:4002/payment', payload, config)
        } else {
            response = await axios.post('http://127.0.0.1:4002/payment', payload, config)
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
    const { order_id, reference_1, reference_2, amount, reference_3, status, process_status, reference, reference_4} = req.body
    console.log("HAS CALLED!!!!")
    if (status === "APPROVED" || process_status === 'true') {
        try {
            const axiosRes = await axios.post('http://localhost:9302/order/create', { order_id, reference_1, reference_2, amount, reference_3, reference, reference_4 })
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

        console.log("Reference: ", reference)
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

        const temp = await TempOrderProductsModel.findOne({ where: { token: reference_3 } });
        if (!temp) return next(new ServiceError(OrderErrorMaster.INVALID_TEMP_TOKEN));

        const products = JSON.parse(temp.products);
        console.log("Product Temp: ", products)
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

        if(!addresses) {
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
                shipping_address:  addresses,
                status: "pending",
            }
        )

        if (products.length > 0) {
            await OrderItemModel.bulkCreate(
                products.map((product: any) => ({
                    order_id: order.id,
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
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
                        total_sales: amount
                    }
                )
            } else {
                topProduct.total_sold += Number(item.amount)
                topProduct.total_sales += Number(amount)
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

        const payment = await axios.post('http://127.0.0.1:4000/api/v1/notify/test/qr', payload, config)

        console.log("Payment", payment)
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

        console.log("Order: ", JSON.stringify(orders))

        const orderHistory = orders.flatMap((o: any) =>
            o.items.map((item: any) => ({
                id: item.id,
                orderID: o.order_id,
                name: item.name,
                size: item.size,
                description: item.product?.description || "",
                price: Number(item.price).toFixed(2),
                time: new Date(o.createdAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                }),
                imageSource: item.product?.image_url

            }))
        );

        console.log("OrderHistory: ", orderHistory)
        orderHistory.sort((a, b) => b.id - a.id);

        res.locals.orderHistory = orderHistory

        return next()


    } catch (err) {
        next(err)
    }
}