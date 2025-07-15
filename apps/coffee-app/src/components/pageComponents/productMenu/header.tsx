import { DateRange } from "@/components/header/dateRange";
import { SearchButton } from "@/components/header/searchBtn";
import { JSX } from "react";
import { Col, Container, Row } from "react-grid-system";
import { AddButton } from "./addBtn";

interface HeaderProps {
    onAddItem: () => void
    handleOnClickSearch: () => Promise<void>
}

export const Header = ({onAddItem,handleOnClickSearch}: HeaderProps): JSX.Element => {
    return (
        <Row style={{ margin: '0px -10px' }}>
            <Col lg={12}>
                <Container fluid>
                    <Row style={{ margin: '10px -10px 0px -31px' }}>
                        <Col lg={2} xs={12}>
                         <SearchButton
                                handleOnClickSearch={handleOnClickSearch}
                                isFetching={false}
                            />
                        </Col>
                        <Col lg={2}>
                            <AddButton onClick={onAddItem} />
                        </Col>
                    </Row>
                </Container>
            </Col>
        </Row>

    )
}