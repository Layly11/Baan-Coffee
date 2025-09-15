import { DateRange } from "@/components/header/dateRange";
import { SearchButton } from "@/components/header/searchBtn";
import { JSX } from "react";
import { Col, Container, Hidden, Row } from "react-grid-system";
import { ClearFilterButton } from "../productMenu/clearFilter";

interface HeaderProps {
    startDate: Date | null
    setStartDate: (startDate: Date | null) => void
    endDate: Date | null
    setEndDate: (endDate: Date | null) => void,
    handleOnClickSearch: () => Promise<void>
    handleOnClearSearch: () => void
}

export const Header = ({
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleOnClickSearch,
    handleOnClearSearch
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
                        <Col lg={5}>
                        </Col>
                        <Col lg={2} xs={12}>
                            <SearchButton
                                handleOnClickSearch={handleOnClickSearch}
                                isFetching={false}
                            />
                        </Col>
                        <Hidden xs sm md>
                            <Col lg={2}>
                                <ClearFilterButton handleOnClearSearch={handleOnClearSearch} />
                            </Col>
                        </Hidden>
                    </Row>
                </Container>
            </Col>
        </Row>

    )
}