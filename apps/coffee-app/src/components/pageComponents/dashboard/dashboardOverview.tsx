import Title from "@/components/commons/title"
import { JSX, useEffect, useState } from "react"
import { Col, Row } from "react-grid-system"
import { SummaryCard } from "./widget/summaryCard"
import { FaCheck, FaLayerGroup, FaRegCreditCard, FaShoppingCart, FaSyncAlt } from "react-icons/fa"
import { OrderStatusCard } from "./widget/orderStatusCard"
import { MdCancel } from "react-icons/md"
import { BestSellingProductsChart, WeeklySalesChart } from "./widget/charts"
import { fetchDashboardOverViewsRequester } from "@/utils/requestUtils"
import { Alert } from "@/helpers/sweetalert"

type TodayOrders = {
    todaySales?: number | string
    payments?: Record<string, number | string>
}

type YesterdayOrders = {
    yesterdaySales?: number | string
    payments?: Record<string, number | string>
}

const DashBoardOverview = (): JSX.Element => {
    const [todayOrders, setTodayOrders] = useState<TodayOrders>({})
    const [yesterdayOrders, setYesterdayOrders] = useState<YesterdayOrders>({})
    const [thisMonthSales, setThisMothSales] = useState('')
    const [allTimeSales, setAllTimeSales] = useState('')
    const [totalOrders, setTotalOrders] = useState('')
    const [orderPending, setOrderPending] = useState('')
    const [ordersDelivered, setOrdersDelivered] = useState('')
    const [orderCancelled, setOrderCancelled] = useState('')
    const [weeklySales, setWeeklySales] = useState<{ date: string; sales: number }[]>([])
    const [bestSellers, setBestSellers] = useState<{ name: string; value: number }[]>([])

    const fetchDashBoardOverview = async () => {
        try {
            const res = await fetchDashboardOverViewsRequester()
            if (res.data !== null) {
                const overview = res.data.overview
                setTodayOrders(overview.todayOrders)
                setYesterdayOrders(overview.yesterdayOrders)
                setThisMothSales(overview.thisMonthSales)
                setAllTimeSales(overview.allData.allTimeSales)
                setTotalOrders(overview.allData.allOrderSales)
                setOrderPending(overview.allData.allOrderPending.length)
                setOrdersDelivered(overview.allData.allOrderComplete.length)
                setOrderCancelled(overview.allData.allOrderCancelled.length)
                setWeeklySales(overview.weeklySales)
                setBestSellers(overview.topProductMapping)
            }
        } catch (err) {
            Alert({ data: err })
        }
    }

    useEffect(() => {
        fetchDashBoardOverview()
    }, [])

    return (
        <>
            <Row justify='between' style={{ margin: '0px -10px' }}>
                <Col sm={12}>
                    <Title>DashBoard Overview</Title>
                </Col>
            </Row>

            <Row justify="between" style={{ margin: '10px -10px 50px 0px' }}>
                <SummaryCard
                    icon={<FaLayerGroup size={32} style={{ marginBottom: 8 }} />}
                    title="Today Orders"
                    amount={`$${Number(todayOrders.todaySales || 0).toFixed(2) ?? "0.00"}`}
                    details={todayOrders.payments ?? { qr: "$00.00", cash: "$0.00", credit: "$0.00" }}
                    bgColor={"#A47148"}
                    textColor={"#fffaf0"}
                />

                <SummaryCard
                    icon={<FaLayerGroup size={32} style={{ marginBottom: 8 }} />}
                    title="Yesterday Orders"
                    amount={`$${Number(yesterdayOrders.yesterdaySales || 0).toFixed(2) ?? "0.00"}`}
                    details={yesterdayOrders.payments ?? { qr: "$00.00", cash: "$0.00", credit: "$0.00" }}
                    bgColor={"#7E4F36"}
                    textColor={"#FFF8E1"}
                />

                <SummaryCard
                    icon={<FaShoppingCart size={32} style={{ marginBottom: 8 }} />}
                    title="This Month"
                    amount={`$${Number(thisMonthSales || 0).toFixed(2)}`}
                    bgColor={"#5D3A00"}
                    textColor={"#FFEBCD"}
                />
                <SummaryCard
                    icon={<FaRegCreditCard size={32} style={{ marginBottom: 8 }} />}
                    title="All-Time Sales"
                    amount={`$${Number(allTimeSales || 0).toFixed(2)}`}
                    bgColor={"#6F4E37"}
                    textColor={"#FDF6EC"}
                />
            </Row>
            <Row justify='between' style={{ margin: '0px -10px 20px 0px' }}>
                <OrderStatusCard
                    icon={<FaShoppingCart color="#f97316" />}
                    label="Total Order"
                    count={totalOrders}
                    iconBg="#fef3c7"
                />
                <OrderStatusCard
                    icon={<FaSyncAlt color="#2760DC" />}
                    label="Orders Pending "
                    count={orderPending}
                    iconBg="#DBEAFE"
                />
                <OrderStatusCard
                    icon={<FaCheck color="#059669" />}
                    label="Orders Delivered"
                    count={ordersDelivered}
                    iconBg="#D1FAE5"
                />
                <OrderStatusCard
                    icon={<MdCancel color="#8B0000" />}
                    label="Order Cancelled"
                    count={orderCancelled}
                    iconBg="#fbeae5"
                />
            </Row>
            <Row justify='between' style={{ margin: '0px -10px 30px 0px' }}>
                <WeeklySalesChart 
                data={weeklySales}
                />
                <BestSellingProductsChart 
                data={bestSellers}
                />
            </Row >
        </>
    )
}

export default DashBoardOverview