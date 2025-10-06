import { JSX } from "react"
import { Col, Container, Row } from "react-grid-system"
import Section from '../../../commons/section'
import { RenderField } from "@/utils/renderField"
import { dayjs } from "../../../../helpers/dayjs"
interface DetailProps {
    isFetching: boolean
    dashboardInfo: any
    mode: 'summary' | 'inventory'
}


const DetailBody = ({
    isFetching,
    dashboardInfo,
    mode
}: Readonly<DetailProps>): JSX.Element => {

    if (mode === 'summary') {
        return (
            <Col xs={12}>
                <Section title="Summary Detail">
                    <Container fluid>
                        <Row style={{ margin: '0px -10px' }}>
                            <Col sm={6} style={{ padding: '0px 20px 0px 0px' }}>
                                <RenderField
                                    label='Sales Date'
                                    value={dayjs(dashboardInfo.date).format('YYYY-MM-DD')}
                                    isFetching={isFetching}
                                    style={{
                                        flexDirectionContainer: 'row',
                                        alignItems: 'flex-end'
                                    }}
                                />
                                <RenderField
                                    label='Sales Total'
                                    value={`${dashboardInfo.total_sales} bath`}
                                    isFetching={isFetching}
                                    style={{
                                        flexDirectionContainer: 'row',
                                        alignItems: 'flex-end'
                                    }}
                                />
                                <RenderField
                                    label='Order'
                                    value={`${dashboardInfo.total_orders} order`}
                                    isFetching={isFetching}
                                    style={{
                                        flexDirectionContainer: 'row',
                                        alignItems: 'flex-end'
                                    }}
                                />
                            </Col>
                            <Col sm={6} style={{ padding: '0px 0px 0px 20px' }}>
                                <RenderField
                                    label='Amount'
                                    value={`${dashboardInfo.total_items} cup `}
                                    isFetching={isFetching}
                                    style={{
                                        flexDirectionContainer: 'row',
                                        alignItems: 'flex-end'
                                    }}
                                />

                                <RenderField
                                    label='Payment'
                                    value={
                                        [
                                            dashboardInfo?.payments?.cash ? `Cash: ${dashboardInfo.payments.cash.toFixed(2)}` : null,
                                            dashboardInfo?.payments?.credit ? `Credit: ${dashboardInfo.payments.credit.toFixed(2)}` : null,
                                            dashboardInfo?.payments?.qr ? `QR: ${dashboardInfo.payments.qr.toFixed(2)}` : null
                                        ]
                                            .filter(Boolean)
                                            .join(' | ')
                                    }
                                    isFetching={isFetching}
                                    style={{
                                        flexDirectionContainer: 'row',
                                        alignItems: 'flex-end'
                                    }}
                                />

                                <RenderField
                                    label='Since'
                                    value={`${dashboardInfo.first_order_time} - ${dashboardInfo.last_order_time}`}
                                    isFetching={isFetching}
                                    style={{
                                        flexDirectionContainer: 'row',
                                        alignItems: 'flex-end'
                                    }}
                                />
                            </Col>
                        </Row>
                    </Container>
                </Section>
            </Col>
        )
    }

    return <></>

}

export default DetailBody