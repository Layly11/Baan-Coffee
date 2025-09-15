import { DateRange } from "@/components/header/dateRange";
import { SearchButton } from "@/components/header/searchBtn";
import { JSX } from "react";
import { Col, Container, Hidden, Row } from "react-grid-system";
import { SelectData } from "@/components/header/selectData";
import { ClearFilterButton } from "@/components/pageComponents/productMenu/clearFilter";
import OrderStatusMaster from '../../../constants/masters/OrderStatusMaster.json'
import OrderMethodMaster from '../../../constants/masters/OrderMethodMaster.json'
import Input from '../../commons/input'
interface HeaderProps {
    startDate: Date | null
    setStartDate: (startDate: Date | null) => void
    endDate: Date | null
    setEndDate: (endDate: Date | null) => void,
    handleOnClearSearch: () => void
    handleOnClickSearch: () => Promise<void>
    status: string | string[]
    setStatus: (peroid: string) => void
    method: string | string[]
    setMethod: (peroid: string) => void
    customerName: string | string[]
    setCustomerName: (peroid: string) => void
}


export const Header = ({ startDate, setStartDate, endDate, setEndDate, handleOnClearSearch, handleOnClickSearch, status, setStatus, method, setMethod, customerName, setCustomerName }: HeaderProps): JSX.Element => {
    return (
        <Row style={{ margin: '0px -10px' }}>
            <Col lg={12}>
                <Container fluid>
                    <Row nogutter style={{ margin: '10px -10px 0px -10px', gap: '8px' }}>
                        <Col lg={3} xs={6} sm={6} >
                            <DateRange
                                startDate={startDate}
                                setStartDate={setStartDate}
                                endDate={endDate}
                                setEndDate={setEndDate}
                            />
                        </Col>
                        <Col lg={5} xs={6} sm={6}>
                            <SelectData
                                placeholder='All Status'
                                value={status}
                                setValue={setStatus}
                                jsonList={OrderStatusMaster}
                                isSearchable={false}
                                isMulti
                                isClearable={false}
                                hideSelectedOptions={false}
                                isShowCheckbox
                                selectAll={{
                                    label: 'All Status'
                                }}
                            />
                        </Col>
                        <Col lg={3} xs={6} sm={6}>
                            <SelectData
                                placeholder='Method'
                                value={method}
                                setValue={setMethod}
                                jsonList={OrderMethodMaster}
                                isSearchable={false}
                                isMulti
                                isClearable={false}
                                hideSelectedOptions={false}
                                isShowCheckbox
                                selectAll={{
                                    label: 'All Status'
                                }}
                            />
                        </Col>

                        <Col lg={5} sm={6} xs={6}>
                            <Input
                                typeof='text'
                                icon='fas fa-search'
                                placeholder='Cutomer Name'
                                value={customerName}
                                onChange={(e) => { setCustomerName(e.target.value) }}
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