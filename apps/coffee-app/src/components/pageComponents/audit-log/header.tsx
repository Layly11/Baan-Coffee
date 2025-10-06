import { SearchButton } from "@/components/header/searchBtn";
import { JSX } from "react";
import { Col, Container, Hidden, Row } from "react-grid-system";
import { ClearFilterButton } from "@/components/pageComponents/productMenu/clearFilter";
import Input from '../../commons/input'
import { SelectData } from "@/components/header/selectData";
import UserRoleMaster from '../../../constants/masters/UserRoleSelect.json'
import auditLogMenuMaster from '../../../constants/masters/auditLogMenuMaster.json'
import { DateRange } from "@/components/header/dateRange";

interface HeaderProps {
    startDate: Date | null
    setStartDate: (endDate: Date | null) => void
    endDate: Date | null
    setEndDate: (endDate: Date | null) => void
    menu: string | string[]
    setMenu: (menu: string) => void
    textSearch: string | string[]
    setTextSearch: (textSearch: string) => void
    handleOnClearSearch: () => void
    handleOnClickSearch: () => Promise<void>
}


export const Header = ({ startDate, setStartDate, endDate, setEndDate, menu, setMenu, textSearch, setTextSearch, handleOnClearSearch, handleOnClickSearch }: HeaderProps): JSX.Element => {
    return (
        <Row style={{ margin: '0px -10px' }}>
            <Col lg={12}>
                <Container fluid>
                    <Row nogutter style={{ margin: '10px -10px 0px -10px', gap: '8px' }}>
                        <Col lg={2.5} xs={6} sm={6}>
                            <DateRange
                                startDate={startDate}
                                setStartDate={setStartDate}
                                endDate={endDate}
                                setEndDate={setEndDate}
                            />
                        </Col>
                        <Col lg={2} xs={6} sm={6}>
                            <SelectData
                                placeholder='All Menu'
                                value={menu}
                                setValue={setMenu}
                                jsonList={auditLogMenuMaster}
                                isSearchable={false}
                                isMulti
                                isClearable={false}
                                hideSelectedOptions={false}
                                isShowCheckbox
                                selectAll={{
                                    label: 'All Menu'
                                }}
                            />
                        </Col>
                        <Col lg={4.5} xs={6} sm={6}>
                            <Input
                                type='text'
                                icon='fas fa-search'
                                placeholder='Search by Name or Staff ID'
                                value={textSearch}
                                maxLength={254}
                                onChange={(e) => { setTextSearch(e.target.value.replace(/[^A-Za-z0-9- ]/g, '')) }}
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