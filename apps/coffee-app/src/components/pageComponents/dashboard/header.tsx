import { DateRange } from "@/components/header/dateRange";
import { JSX } from "react";
import { Col, Container, Row } from "react-grid-system";

interface HeaderProps {
    startDate: Date | null
    setStartDate: (startDate: Date | null) => void
    endDate: Date | null
    setEndDate: (endDate: Date | null) => void
}

export const Header = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,

}: Readonly<HeaderProps>): JSX.Element => {
    return (
        <Row style={{ margin: '0px -10px' }}>
            <Col lg={12}>
                <Container fluid>
                    <Row style={{ margin: '10px -10px 0px -31px' }}>
                        <Col lg={3} xs={6} sm={6}>
                            <DateRange
                                startDate={startDate}
                                setStartDate={setStartDate}
                                endDate={endDate}
                                setEndDate={setEndDate}
                            />
                        </Col>
                    </Row>
                </Container>
            </Col>
        </Row>

    )
}