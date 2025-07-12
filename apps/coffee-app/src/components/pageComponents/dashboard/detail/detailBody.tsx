import { JSX } from "react"
import { Col, Container, Row } from "react-grid-system"
import Section from '../../../commons/section'
import { RenderField } from "@/utils/renderField"
interface DetailProps {
    isFetching: boolean
    dashboardInfo: any
}

const DetailBody = ({
    isFetching,
    dashboardInfo
}: Readonly<DetailProps>): JSX.Element => {
    return (
        <Col xs={12}>
            <Section title="Detail">
                <Container fluid>
                    <Row style={{ margin: '0px -10px' }}>
                        <Col sm={6} style={{ padding: '0px 20px 0px 0px' }}>
                            <RenderField
                                label='Sales Date'
                                value={dashboardInfo.date}
                                isFetching={isFetching}
                                style={{
                                    flexDirectionContainer: 'row',
                                    alignItems: 'flex-end'
                                }}
                            />
                        </Col>
                    </Row>
                </Container>
            </Section>
        </Col>
    )
}

export default DetailBody