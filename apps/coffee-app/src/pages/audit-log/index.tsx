import withAuthenticated from "@/hocs/withAuthenticated";
import Head from "next/head";
import { JSX, useEffect, useState } from "react";
import title from '../../constants/title.json'
import { dayjs } from '../../helpers/dayjs'
import { useRouter } from "next/router";
import MainLayout from "@/components/layouts/mainLayout";
import { useSelector } from "react-redux";
import { UseSelectorProps } from "@/props/useSelectorProps";
import { Col, Row } from "react-grid-system";
import Title from '../../components/commons/title'
import { Header } from "@/components/pageComponents/audit-log/header";
import Table from "@/components/commons/table";
import { Columns } from "@/components/pageComponents/audit-log/column";
import { AuditLogActionType } from "@/types/initTypes";
import { Alert } from "@/helpers/sweetalert";
import { fetchAuditLogRequester } from "@/utils/requestUtils";
import { checkNullUndefiendEmptyString, parseToArrayAndRemoveSelectAllValue } from "@/utils/parseUtils";


const pathname = '/audit-log'
const AuditLogPage = (): JSX.Element => {
    const router = useRouter()
    const user = useSelector((state: UseSelectorProps) => state.user)
    const [isFetching, setIsFetching] = useState(false)
    const [isSearch, setIsSearch] = useState(false)

    const [startDate, setStartDate] = useState<Date | null>(
        router.query.startDate !== undefined
            ? dayjs(router.query.startDate as string).toDate()
            : dayjs().startOf('day').toDate()
    )
    const [endDate, setEndDate] = useState<Date | null>(
        router.query.endDate !== undefined
            ? dayjs(router.query.endDate as string).toDate()
            : dayjs().toDate()
    )
    const [page, setPage] = useState(!isNaN(Number(router.query.page)) ? Number(router.query.page) : 0)
    const [pageSize, setPageSize] = useState(!isNaN(Number(router.query.limit)) ? Number(router.query.limit) : 10)
    const [total, setTotal] = useState(0)
    const [rows, setRows] = useState([])
    const [menu, setMenu] = useState(router.query.menu ?? '')
    const [textSearch, setTextSearch] = useState<string | string[]>(router.query.textSearch ?? '')



    const handleFetchAuditLog = (auditAction?: AuditLogActionType) => async (page?: number, isClear?: boolean): Promise<void> => {
        setIsFetching(true)
        setIsSearch(false)
        console.log("fetch")

        try {
            const config = {
                params: {
                    audit_action: isClear ? undefined : auditAction,
                    start_date: isClear ? dayjs().startOf('day').toDate() : dayjs(startDate).format('YYYY-MM-DD'),
                    end_date: isClear ? dayjs().toDate() : dayjs(endDate).format('YYYY-MM-DD'),
                    menu: isClear ? '' : parseToArrayAndRemoveSelectAllValue(checkNullUndefiendEmptyString(menu)),
                    text_search: isClear ? '' : checkNullUndefiendEmptyString(textSearch),
                    limit: (pageSize),
                    offset: (pageSize * (page ?? 0))
                }
            }
            const response = await fetchAuditLogRequester(config)
            setTotal(response.data.total)
            setRows(response.data.audit_logs)

        } catch (err) {
            console.error(err)
            Alert({
                data: err
            })
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        handleFetchAuditLog(AuditLogActionType.VIEW_AUDIT_LOG)()
    }, [])


    const handleOnClickSearch = async (): Promise<void> => {
        setIsSearch(false)
        setPage(0)
        router.replace({
            pathname,
            query: {
                startDate: dayjs(startDate).format('YYYY-MM-DD'),
                endDate: dayjs(endDate).format('YYYY-MM-DD'),
                menu,
                textSearch
            }
        })
        await handleFetchAuditLog(AuditLogActionType.SEARCH_AUDIT_LOG)()
    }

    const handleOnClearSearch = async (): Promise<void> => {
        setStartDate(dayjs().startOf('day').toDate())
        setEndDate(dayjs().toDate())
        setMenu('')
        setTextSearch('')

        router.replace({
            pathname
        })
        await handleFetchAuditLog(AuditLogActionType.SEARCH_AUDIT_LOG)(0, true)
    }


    const handleOnChangePage = async (page: number): Promise<void> => {
        setPage(page)
        router.replace({
            pathname,
            query: { ...router.query, page }
        })

        await handleFetchAuditLog()(page)
    }
    return (
        <>
            <Head>
                <title>{title.AUDIT_LOG}</title>
            </Head>
            <MainLayout isFetching={user === null}>
                <Row justify="between" style={{ margin: '0px - 10px' }}>
                    <Col xs={12}>
                        <Title>Audit Log</Title>
                    </Col>
                </Row>

                <Header
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    menu={menu}
                    setMenu={setMenu}
                    textSearch={textSearch}
                    setTextSearch={setTextSearch}
                    handleOnClearSearch={handleOnClearSearch}
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
            </MainLayout>
        </>
    )
}

export default withAuthenticated(AuditLogPage)