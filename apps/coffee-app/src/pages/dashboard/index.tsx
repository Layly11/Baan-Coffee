import withAuthenticated from "@/hocs/withAuthenticated"
import { UseSelectorProps } from "@/props/useSelectorProps"
import Head from "next/head"
import { useRouter } from "next/router"
import { useSelector } from "react-redux"
import title from '../../constants/title.json'
import { Col, Container, Row } from 'react-grid-system'
import MainLayout from "@/components/layouts/mainLayout"
import Title from "@/components/commons/title"
import { useState } from "react"
import { dayjs } from '../../helpers/dayjs'
import { Header } from "@/components/pageComponents/dashboard/header"
import Table from "@/components/commons/table"
import { Columns } from "@/components/pageComponents/dashboard/column"

export const mockRows = [
  {
    id: 1,
    date: '2025-07-01',
    totalSales: 1200,
    order: 32,
    shift: 'Morning',
    staffCount: 3,
    bestSeller: 'Iced Latte',
    notifications: 'Promotion applied',
    viewDetails: 'Click to view'
  },
  {
    id: 2,
    date: '2025-07-02',
    totalSales: 860,
    order: 22,
    shift: 'Evening',
    staffCount: 3,
    bestSeller: 'Cappuccino',
    notifications: 'Low stock alert',
    viewDetails: 'Click to view'
  },
  {
    id: 3,
    date: '2025-07-03',
    totalSales: 1520,
    order: 45,
    shift: 'Afternoon',
    staffCount: 3,
    bestSeller: 'Cold Brew',
    notifications: 'System synced',
    viewDetails: 'Click to view'
  },
  {
    id: 4,
    date: '2025-07-04',
    totalSales: 980,
    order: 27,
    shift: 'Morning',
    staffCount: 3,
    bestSeller: 'Mocha',
    notifications: '',
    viewDetails: 'Click to view'
  }
]


const pathname = '/dashboard'

const DashBoardPage = () => {
  const user = useSelector((state: UseSelectorProps) => state.user)
  const router = useRouter()
  const [isFetching, setIsFetching] = useState(false)
  const [isSearch, setIsSearch] = useState(false)


  const [total, setTotal] = useState(4)
  const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
  const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
  const [rows, setRows] = useState(mockRows)
  const [startDate, setStartDate] = useState<Date | null>(
    router.query.startDate != undefined
      ? dayjs(router.query.startDate as string).toDate()
      : dayjs().startOf('day').toDate()
  )

  const [endDate, setEndDate] = useState<Date | null>(
    router.query.endDate !== undefined
      ? dayjs(router.query.startDate as string).toDate()
      : dayjs().toDate()
  )

    const handleOnChangePage = async (page: number): Promise<void> => {
    setPage(page)
    router.replace({
      pathname,
      query: { ...router.query, page }
    })
  }
  return (
    <>
      <Head>
        <title>{title.DASHBOARD_TITLE}</title>
      </Head>

      <MainLayout isFetching={user === null}>
        <Container fluid>
          <Row justify='between' style={{ margin: '0px -10px' }}>
            <Col sm={12}>
              <Title>DashBoard</Title>
            </Col>
          </Row>
          <Header
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
          <Row style={{ margin: '20px -10px 0px -10px' }}>
            <Col xs={12}>
              <Table
                isFetching={isFetching}
                total={total}
                pageSize={pageSize}
                setPageSize={setPageSize}
                setPage={handleOnChangePage}
                page={page}
                columns={Columns()}
                onClickRow={(row) => {
                  router.push(`${pathname}/${row.id}`)
                }}
                rows={rows}
                isSearch={isSearch}
              />
            </Col>
          </Row>

        </Container>
      </MainLayout>
    </>
  )
}

export default withAuthenticated(DashBoardPage)

