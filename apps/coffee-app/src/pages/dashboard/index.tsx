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
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'
import PermissionActionMaster from '../../constants/masters/PermissionActionMaster.json'
import { checkPermission } from "@/helpers/checkPermission"
import { checkRouterQueryAndAutoFetchData } from "@/utils/parseUtils"


const pathname = '/dashboard'

const DashBoardPage = () => {
  const user = useSelector((state: UseSelectorProps) => state.user)
  const router = useRouter()
  const [isFetching, setIsFetching] = useState(false)
  const [isSearch, setIsSearch] = useState(true)
  const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
  const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
  const [total, setTotal] = useState(0)
  const [rows, setRows] = useState<any>([])
  const [startDate, setStartDate] = useState<Date | null>(
    router.query.startDate != undefined
      ? dayjs(router.query.startDate as string).toDate()
      : dayjs().startOf('day').toDate()
  )

  const [endDate, setEndDate] = useState<Date | null>(
    router.query.endDate !== undefined
      ? dayjs(router.query.endDate as string).toDate()
      : dayjs().toDate()
  )

  const fetchDashboardSummaryList = async (page?: number) => {
    try {
      setIsFetching(true)
      setIsSearch(false)
      const config = {
        params: {
          start_date: dayjs(startDate).format('YYYY-MM-DD'),
          end_date: dayjs(endDate).format('YYYY-MM-DD'),
          limit: (pageSize),
          offset: (pageSize * (page ?? 0))
        }
      }
      const response = await fetchDashboardSummary(config)
      console.log('DATA', response.data)
      if (response.data != null) {
        const total = response.data.total
        const summary = response.data.summaryList
        setRows(summary)
        setTotal(total)
      }
    } catch (err) {
      console.error(err)
      Alert({ data: err })
    } finally {
      setIsFetching(false)
    }
  }


  const handleOnClickSearch = async (): Promise<void> => {
    setIsSearch(false)
    setPage(0)
    router.replace({
      pathname,
      query: {
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
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


  useEffect(() => {
    const page = PermissionMenuMaster.DASHBOARD
    const action = PermissionActionMaster.VIEW
    checkPermission({ user, page, action }, router)
  }, [user])

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.startDate && dayjs(router.query.startDate as string).isValid()) {
      setStartDate(dayjs(router.query.startDate as string).toDate())
    } else {
      setStartDate(dayjs().startOf('day').toDate())
    }


    if (router.query.endDate && dayjs(router.query.endDate as string).isValid()) {
      setEndDate(dayjs(router.query.endDate as string).toDate())
    } else {
      setEndDate(dayjs().toDate())
    }

    if (typeof router.query.page === 'string' && !isNaN(Number(router.query.page))) {
      setPage(Number(router.query.page))
    }
    if (typeof router.query.limit === 'string' && !isNaN(Number(router.query.limit))) {
      setPageSize(Number(router.query.limit))
    }
  }, [router.isReady, router.query])

  useEffect(() => {
    if (!router.isReady) return
    checkRouterQueryAndAutoFetchData({
      query: router.query,
      fetchData: fetchDashboardSummaryList
    })
    console.log('Fetch')
  }, [router.isReady, router.query])

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

