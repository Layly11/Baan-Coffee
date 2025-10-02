import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts"
import styled from "styled-components"

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 45%;
`

const Title = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
`

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
`

const TabButton = styled.button<{ active: boolean }>`
  color: ${({ active }) => (active ? '#059669' : '#9CA3AF')};
  font-weight: ${({ active }) => (active ? '600' : 'normal')};
  background: none;
  border: none;
  cursor: pointer;
`

interface WeeklySalesChartProps {
  data: { date: string; sales: number }[]
}


// const salesData = [
//   { date: "2025-07-14", sales: 360 },
//   { date: "2025-07-15", sales: 620 },
//   { date: "2025-07-16", sales: 1440 },
//   { date: "2025-07-17", sales: 280 }
// ]

// const bestSellers = [
//   { name: "Mint", value: 400 },
//   { name: "Lettuce", value: 300 },
//   { name: "Organic Baby Carrot", value: 280 },
//   { name: "Yellow Sweet Corn", value: 320 }
// ]

const COLORS = ["#10B981", "#3B82F6", "#F97316", "#60A5FA"]

export const WeeklySalesChart = ({data}: WeeklySalesChartProps) => {
  const [tab, setTab] = useState("Sales")


  return (
    <Card>
      <Title>Weekly Sales</Title>
      <Tabs>
        <TabButton active={tab === "Sales"} onClick={() => setTab("Sales")}>Sales</TabButton>
      </Tabs>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="total_sales" stroke="#10B981" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

interface BestSellingProductsChartProps {
  data: { name: string; value: number }[]
}

export const BestSellingProductsChart = ({data}: BestSellingProductsChartProps) => {
  return (
    <Card>
      <Title>Best Selling Products</Title>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
