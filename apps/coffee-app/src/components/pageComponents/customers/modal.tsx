import { JSX, useEffect, useState } from "react"
import { ModalBackgroundContainer, ModalCard, ModalCardBody, ModalContainer, ButtonContainer } from "@/components/commons/modal"
import { Alert } from "@/helpers/sweetalert"
import { Col, Row } from "react-grid-system"
import Input from "@/components/commons/input"
import { updateCustomerRequester } from "@/utils/requestUtils"
// import { updateCustomerRequester } from "@/utils/requestUtils"
type Props = {
    isOpen: boolean
    onClose: () => void
    customer: any
    onUpdated: () => void
}

export const EditCustomerModal = ({ isOpen, onClose, customer, onUpdated }: Props) => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', verified: false })
    const [isChanged, setIsChanged] = useState(false)


    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || '',
                verified: customer.verified || '',
            })
            setIsChanged(false) 
        }
    }, [customer])


    useEffect(() => {
        if (!customer) return

        const hasChanged =
            form.name !== (customer.name || '') ||
            form.email !== (customer.email || '') ||
            form.phone !== (customer.phone || '') ||
            form.verified !== (customer.verified || false)

        setIsChanged(hasChanged)
    }, [form, customer])

   const palette = {
        btnCancel: {
            color: "#d9d9d9",
            backgroundColor: "#ffffff",
        },
        btnConfirm: {
            color: "#ffffff",
            backgroundColor: "#d9d9d9",
        },
        btnConfirmActive: {
            color: "#ffffff",
            backgroundColor: "#5D3A00",
        },
    };
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target
    setForm({
        ...form,
        [name]: type === 'checkbox' ? checked : value
    })
}


    const handleSubmit = async () => {
        try {
            if (!customer) return

            await updateCustomerRequester(customer.id, form)

            onUpdated()
            onClose()
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        }
    }


    if (!isOpen) return null

    return (
        <ModalBackgroundContainer>
            <ModalContainer>
                <ModalCard>
                    <ModalCardBody>
                        <Col lg={12}>
                            <label className="title">
                                Edit Customer
                            </label>
                        </Col>

                        <Row style={{ marginTop: "12px", alignItems: "center" }}>
                            <Col lg={1.7}>
                                <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                    Name
                                </label>
                            </Col>
                            <Col lg={8}>
                                <Input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: "12px", alignItems: "center" }}>
                            <Col lg={1.7}>
                                <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                    Email
                                </label>
                            </Col>
                            <Col lg={8}>
                                <Input
                                    type="text"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>
                        <Row style={{ marginTop: "12px", alignItems: "center" }}>
                            <Col lg={1.7}>
                                <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                    Phone
                                </label>
                            </Col>
                            <Col lg={8}>
                                <Input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: '12px', alignItems: 'center' }}>
                            <Col lg={1.7}>
                                <label style={{ fontWeight: 500, color: '#b3b3b3' }}>Verified</label>
                            </Col>
                            <Col lg={3}>
                                <input
                                    type='checkbox'
                                    name='verified'
                                    checked={form.verified}
                                    onChange={handleChange}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: '30px' }}>
                            <Col md={6}>
                                <div onClick={onClose}>
                                    <ButtonContainer $backgroundColor='#fff' $color='#d9d9d9'>
                                        ยกเลิก
                                    </ButtonContainer>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div
                                    onClick={isChanged ? handleSubmit : undefined}
                                >
                                    <ButtonContainer
                                        $backgroundColor={isChanged ? "#5D3A00" : "#ccc"}
                                        $color={!isChanged ? palette.btnConfirmActive.color : palette.btnConfirm.color}
                                    >
                                        ยืนยัน
                                    </ButtonContainer>
                                </div>
                            </Col>
                        </Row>
                    </ModalCardBody>
                </ModalCard>
            </ModalContainer>
        </ModalBackgroundContainer>
    )
}


export const DeleteCustomerModal = ({ visible, onCancel, onConfirm }: any): JSX.Element => {
    if (!visible) return <></>

    return (
        <ModalBackgroundContainer style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
            <ModalContainer>
                <ModalCard style={{ backgroundColor: '#f7f0e8', borderRadius: '16px', boxShadow: '0 4px 20px rgba(93, 58, 0, 0.2)' }}>
                    <ModalCardBody>
                        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                            <i className="fa fa-trash fa-4x" style={{ color: '#5D3A00', marginBottom: '20px' }} />
                            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px', color: '#3e2c1c' }}>Delete Item</h2>
                            <p style={{ color: '#6b4c3b', fontSize: '15px', marginBottom: '40px' }}>
                                Are you sure you want to delete this Customer?<br />
                            </p>
                            <Row gutterWidth={16}>
                                <Col md={6}>
                                    <div onClick={onCancel}>
                                        <ButtonContainer
                                            $backgroundColor="#fff"
                                            $color="#a18c7c"
                                            style={{
                                                border: '1px solid #c4b5a5',
                                                borderRadius: '8px',
                                            }}
                                        >
                                            ยกเลิก
                                        </ButtonContainer>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div onClick={() => { void onConfirm() }}>
                                        <ButtonContainer
                                            $backgroundColor="#5D3A00"
                                            $color="#fff"
                                            style={{ borderRadius: '8px' }}
                                        >
                                            ยืนยัน
                                        </ButtonContainer>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </ModalCardBody>
                </ModalCard>
            </ModalContainer>
        </ModalBackgroundContainer>
    )
}
