import { DateRange } from "@/components/header/dateRange";
import { SearchButton } from "@/components/header/searchBtn";
import { JSX } from "react";
import { Col, Container, Hidden, Row } from "react-grid-system";
import { SelectData } from "@/components/header/selectData";
import { ClearFilterButton } from "@/components/pageComponents/productMenu/clearFilter";

interface HeaderProps {
    startDate: Date | null
    setStartDate: (startDate: Date | null) => void
    endDate: Date | null
    setEndDate: (endDate: Date | null) => void,
    handleOnClearSearch: () => void
    handleOnClickSearch: () => Promise<void>
}


export const Header = ({ startDate, setStartDate, endDate, setEndDate, handleOnClearSearch, handleOnClickSearch, }: HeaderProps): JSX.Element => {
    return (
        <Row style={{ margin: '0px -10px' }}>
            <Col lg={12}>
                <Container fluid>
                    <Row style={{ margin: '10px -10px 0px -31px' }}>
                        {/* <Col lg={3.5} xs={6} sm={6}>
                            <SelectData
                                placeholder="Categories"
                                value={categories}
                                setValue={setCategories}
                                jsonList={Object.fromEntries(
                                    categoryList.map((name) => [name, { label: name }])
                                )}
                                isSearchable={false}
                                isMulti
                                isClearable={false}
                                hideSelectedOptions={false}
                                isShowCheckbox
                                selectAll={{
                                    label: 'All Categories'
                                }}

                            />
                        </Col> */}
                        <Col lg={3} xs={6} sm={6}>
                            <DateRange
                                startDate={startDate}
                                setStartDate={setStartDate}
                                endDate={endDate}
                                setEndDate={setEndDate}
                            />
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