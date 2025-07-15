import Title from "@/components/commons/title";
import { JSX } from "react";
import { Col, Container, Row } from "react-grid-system";
import DetailTable from './renderTable'


interface DetailTableProps {
    detailInfo : any[]
    title: string,
    type: string
}
const DetailsTable = ({detailInfo,title,type}: DetailTableProps): JSX.Element => {
    return (
        <>
        <Col xl={12}>
        <Container fluid>
            <Col >
            <Title>{title}</Title>
            </Col>
             <Row style={{ margin: '10px -30px' }}>
            <DetailTable detailInfo={detailInfo} type={type}/>
          </Row>
        </Container>
        </Col>
        </>
    )
}

export default DetailsTable