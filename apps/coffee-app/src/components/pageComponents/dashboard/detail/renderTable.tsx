import { Col, Container, Row } from "react-grid-system"
import TableInvertory from "./tableInventory"
import TableShift from "./shiftTable"
import TableTopProuduct from "./topProductTable"


interface DetailTableProps {
    detailInfo: any[]
    type: string
}

const renderTable = ({ type, detailInfo }: DetailTableProps, column: any) => {
    switch (type) {
        case 'inventory':
            return (
                <TableInvertory
                    isFetching={false}
                    rows={detailInfo}
                    columns={column}
                />
            )
        case 'shift': 
            return (
                <TableShift 
                isFetching={false}
                rows={detailInfo}
                columns={column}
                />
            )
        case 'top_products': 
            return (
                <TableTopProuduct 
                isFetching={false}
                rows={detailInfo}
                columns={column}
                />
            )
        default: null
    }
}

const getColumnByType = (type: string) => {
    switch (type) {
        case 'inventory':
            return (
                [
                    { label: 'ProductName' },
                    { label: 'Remaining' },
                    { label: 'Unit' },
                    { label: 'Alert Level' },
                    { label: 'Status' },
                    { label: 'Last Updated' },
                ]
            )
        case 'shift': 
            return (
                [
                    {label: 'Name'},
                    {label: 'Role'},
                    {label: 'Clock-In / Clock-Out'},
                    {label: 'Status'},
                    {label: 'Note'},
                ]
            )
        case 'top_products': 
            return (
                [
                    {label: 'No'},
                    {label: 'Product'},
                    {label: 'Amount'},
                    {label: 'Total Sales'}
                ]
            )
        default: null
    }

}
const DetailTable = ({ detailInfo, type }: DetailTableProps) => {
    const column = getColumnByType(type)

    return (
        <Col xs={12}>
            <Container fluid>
                <Row style={{ margin: '0px -10px 10px ' }}>
                    <Col sm={12}>
                        {renderTable({ type, detailInfo }, column)}
                    </Col>
                </Row>
            </Container>
        </Col>
    )
}

export default DetailTable
