import { NextFunction, Request, Response } from "express";
import crypto from 'crypto'
import axios from 'axios'
import { OrderModel, sequelize, DailySummaryModel, CartModel, TopProductModel, PaymentModel } from "@coffee/models";
import { Op } from "sequelize";
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
    const { amount, selectedMethod, product } = req.body
    const t = await sequelize.transaction();
    console.log("Product: ", product)

    const descriptionProduct = product.map((p: any) => `${p.name} qty: ${p.amount}`).join(', ')
    try {
        const signKey = process.env.SIGN_KEY!
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
            reference_3: JSON.stringify(product),
            qrcode: {
                biller_reference_1: biller_reference_1
            }
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
    const { order_id, reference_1, reference_2, amount, reference_3, status, process_status, reference } = req.body

    if (status === "APPROVED" || process_status === 'true') {
        try {
            const axiosRes = await axios.post('http://localhost:9302/order/create', { order_id, reference_1, reference_2, amount, reference_3, reference })
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
        const { order_id, reference_1, reference_2, amount, reference_3, status, reference } = req.body

        const ref3 = JSON.parse(reference_3)

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

        const order = await OrderModel.create(
            {
                summary_id: summary.id,
                order_id: order_id,
                customer_id: Number(reference_1),
                payment_method: reference_2,
                total_price: amount,
                time: new Date(),
                status: "pending",
                items: ref3.map((p: any) => ({ name: p.name, qty: p.amount }))
            }
        )

        await payment.update({ order_id: order.id, status: 'APPROVED', reference })

        const totalItems = ref3.reduce((acc: any, i: any) => acc + i.amount, 0);
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


        for (const item of ref3) {
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
        res.locals.payment= payment.data
        return next()
    } catch (err) {
        next(err)
    }
}