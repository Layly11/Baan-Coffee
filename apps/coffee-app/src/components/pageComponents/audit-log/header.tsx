import { SearchButton } from "@/components/header/searchBtn";
import { JSX } from "react";
import { Col, Container, Hidden, Row } from "react-grid-system";
import { ClearFilterButton } from "@/components/pageComponents/productMenu/clearFilter";
import Input from '../../commons/input'
import { SelectData } from "@/components/header/selectData";
import UserRoleMaster from '../../../constants/masters/UserRoleSelect.json'
interface HeaderProps {
    handleOnClearSearch: () => void
    handleOnClickSearch: () => Promise<void>
}


export const Header = ({ handleOnClearSearch, handleOnClickSearch}: HeaderProps): JSX.Element => {
    return (
        <Row style={{ margin: '0px -10px' }}>
            <Col lg={12}>
                <Container fluid>
                    <Row nogutter style={{ margin: '10px -10px 0px -10px', gap: '8px' }}>
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