import { SearchButton } from "@/components/header/searchBtn";
import { JSX } from "react";
import { Col, Container, Hidden, Row } from "react-grid-system";
import { ClearFilterButton } from "@/components/pageComponents/productMenu/clearFilter";
import Input from '../../commons/input'
import { SelectData } from "@/components/header/selectData";
import UserRoleMaster from '../../../constants/masters/UserRoleSelect.json'
interface HeaderProps {
    information: string | string[]
    role: string | string[]
    setRole: React.Dispatch<React.SetStateAction<string | string[]>>
    setInformation: React.Dispatch<React.SetStateAction<string | string[]>>
    handleOnClearSearch: () => void
    handleOnClickSearch: () => Promise<void>
}


export const Header = ({ handleOnClearSearch, handleOnClickSearch, information, setInformation, role, setRole}: HeaderProps): JSX.Element => {
    return (
        <Row style={{ margin: '0px -10px' }}>
            <Col lg={12}>
                <Container fluid>
                    <Row nogutter style={{ margin: '10px -10px 0px -10px', gap: '8px' }}>
                        <Col lg={5} sm={6} xs={6}>
                            <Input
                                typeof='text'
                                icon='fas fa-search'
                                placeholder='Search by name/email'
                                value={information}
                                onChange={(e) => { setInformation(e.target.value)}}
                            />
                        </Col>
                         <Col lg={5} xs={6} sm={6}>
                            <SelectData
                                placeholder='Role'
                                value={role}
                                setValue={setRole}
                                jsonList={UserRoleMaster}
                                isSearchable={false}
                                isMulti
                                isClearable={false}
                                hideSelectedOptions={false}
                                isShowCheckbox
                                selectAll={{
                                    label: 'All Role'
                                }}
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