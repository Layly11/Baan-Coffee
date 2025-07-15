import { JSX } from "react"
import { Col, Container, Row } from "react-grid-system"
import DetailBody from "./detailBody"

interface DetailProps {
    isFetching: boolean
    dashboardInfo: any
    mode: 'summary' | 'inventory'
}

const Detail = ({
    isFetching,
    dashboardInfo,
    mode
}: Readonly<DetailProps>): JSX.Element => {
    return (
        <>
            <Col xl={12}>
                <Container fluid>
                    <Row style={{ margin: '10px -10px' }}>
                        <DetailBody isFetching={isFetching} dashboardInfo={dashboardInfo} mode={mode}/>
                    </Row>
                </Container>
            </Col>
        </>
    )
}

export default Detail