import withAuthenticated from "@/hocs/withAuthenticated"
import { UseSelectorProps } from "@/props/useSelectorProps"
import Head from "next/head"
import { useRouter } from "next/router"
import { useSelector } from "react-redux"
import title from '../../constants/title.json'
import { Col, Container, Row } from 'react-grid-system'
import MainLayout from "@/components/layouts/mainLayout"
import Title from "@/components/commons/title"
import { useEffect, useState } from "react"
import { dayjs } from '../../helpers/dayjs'
import { Header } from "@/components/pageComponents/dashboard/header"
import Table from "@/components/commons/table"
import { Columns } from "@/components/pageComponents/dashboard/column"
import { fetchDashboardSummary } from '../../utils/requestUtils'
import { Alert } from "@/helpers/sweetalert"


const pathname = '/dashboard'

const DashBoardPage = () => {
  const user = useSelector((state: UseSelectorProps) => state.user)
  const router = useRouter()
  const [isFetching, setIsFetching] = useState(false)
  const [isSearch, setIsSearch] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
  const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
  const [rows, setRows] = useState([])
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

  const fetchDashboardSummaryList = async (page?: number) => {
    try {
      setIsFetching(true)
      const config = {
        params: {
          start_date: dayjs(startDate).format('YYYY-MM-DD'),
          end_date: dayjs(endDate).format('YYYY-MM-DD'),
          limit: (pageSize),
          offset: (pageSize * (page ?? 0))
        }
      }
      const response = await fetchDashboardSummary(config)
      console.log('Response: ', response.data)
      if (response.data != null) {
        const total = response.data.total
        const summary = response.data.summaryList.map((summary: any) => ({
          id: summary.id,
          date:  dayjs(summary.date).format('DD/MM/YYYY'),
          totalSales: summary.total_sales,
          orders: summary.total_orders,
          shift: summary.shifts,
          bestSeller: summary.top_products[0]?.product_name || '-',
          notifications: summary.inventory_statuses.some((i: any) => i.status !== 'normal') ? '1 รายการ' : '-',
        }))
        console.log('Summary: ', summary)
        setRows(summary)
        setTotal(total)
        setIsFetching(false)
      }
    } catch (err) {
      console.error(err)
      Alert({ data: err })
    }
  }

  useEffect(() => {
    fetchDashboardSummaryList()
  }, [])

    const handleOnClickSearch = async (): Promise<void> => {
    setIsSearch(false)
    setPage(0)
    router.replace({
      pathname,
      query: {
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(startDate).format('YYYY-MM-DD'),
      }
    })
     fetchDashboardSummaryList()
  }

  const handleOnChangePage = async (page: number): Promise<void> => {
    setPage(page)
    router.replace({
      pathname,
      query: { ...router.query, page }
    })

    fetchDashboardSummaryList(page)
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
            handleOnClickSearch={handleOnClickSearch}
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

