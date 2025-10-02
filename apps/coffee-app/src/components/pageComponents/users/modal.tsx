import { ButtonContainer, ModalBackgroundContainer, ModalCard, ModalCardBody, ModalContainer } from "@/components/commons/modal"
import swalInstance, { Alert } from "@/helpers/sweetalert"
import { JSX, useEffect, useState } from "react"
import { Col, Row } from "react-grid-system"
import { SelectData } from "@/components/header/selectData"
import UserSelectRoleMaster from '../../../constants/masters/UserRoleSelect.json'
import styled from "styled-components";
import { createUserRequester, updatUserRequester } from "@/utils/requestUtils"


type Props = {
    isOpen: boolean
    onClose: () => void
    user: any
    onUpdated: () => void
    currentUser: any
}

export const EditUserModal = ({ isOpen, onClose, user, onUpdated, currentUser }: Props) => {
    const [form, setForm] = useState({ username: '', email: '', phone: '', role: '', status: false })
    

    const filteredRoleList = Object.entries(UserSelectRoleMaster)
    .filter(([roleId, role]) => {
        if (currentUser.role === 'ADMIN') { 
            return roleId === "3" || roleId === "4" 
        }
        return true 
    })
    .reduce((acc, [roleId, role]) => {
        (acc as Record<string, typeof role>)[roleId] = role
        return acc
    }, {} as Record<string, (typeof UserSelectRoleMaster)[keyof typeof UserSelectRoleMaster]>)


    useEffect(() => {
        if (user) {
            setForm({
                username: user.username || '',
                email: user.email || '',
                phone: user.phone || '',
                role: String(user.role_id) || '',
                status: !!user.status
                ,
            })
        }
    }, [user])




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
    const handleSelectRole = (value: string) => {
        setForm({ ...form, role: value })
    }



    const handleSubmit = async () => {
        try {
            if (!user) return

              if (!form.username.trim() || !form.email.trim() || !form.role) {
            await swalInstance.fire({
                icon: "warning",
                title: "ข้อมูลไม่ครบ",
                text: "กรุณากรอกชื่อ, อีเมล และเลือก Role",
            })
            return
        }

            await updatUserRequester(user.id, form)

            onUpdated()
            onClose()
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        }
    }

        const isFormChanged =
        form.username !== (user?.username || "") ||
        form.email !== (user?.email || "") ||
        form.phone !== (user?.phone || "") ||
        form.role !== String(user?.role_id || "") ||
        form.status !== !!user?.status



    if (!isOpen) return null

    return (
        <ModalBackgroundContainer>
            <ModalContainer>
                <ModalCard>
                    <ModalCardBody>
                        <Col lg={12}>
                            <label className="title">
                                Edit User
                            </label>
                        </Col>

                        <Row style={{ marginTop: "12px", alignItems: "center" }}>
                            <Col lg={1.5}>
                                <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                    Name
                                </label>
                            </Col>
                            <Col lg={8}>
                                <Input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: "12px", alignItems: "center" }}>
                            <Col lg={1.5}>
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
                            <Col lg={1.5}>
                                <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                    Role
                                </label>
                            </Col>
                            <Col lg={8}>
                                <SelectData
                                    placeholder="Role"
                                    value={form.role}
                                    setValue={handleSelectRole}
                                    jsonList={filteredRoleList}
                                    isSearchable={false}
                                    isClearable={false}
                                    hideSelectedOptions={false}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: '12px', alignItems: 'center' }}>
                            <Col lg={1.47}>
                                <label style={{ fontWeight: 500, color: '#b3b3b3' }}>Active</label>
                            </Col>
                            <Col lg={3}>
                                <input
                                    type='checkbox'
                                    name='status'
                                    checked={form.status}
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
                                     onClick={isFormChanged ? handleSubmit : undefined}
                                >
                                    <ButtonContainer
                                        $backgroundColor={isFormChanged ? "#5D3A00" : "#ccc"}
                                        $color={!isFormChanged ? palette.btnConfirmActive.color : palette.btnConfirm.color}
                                        style={{ cursor: isFormChanged ? "pointer" : "not-allowed" }}
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
export const AddUserModal = ({ isOpen, onClose, onUpdated, user }: any) => {
    const [form, setForm] = useState({ username: '', email: '', password: '', phone: '', role: '', status: false })

 

    const filteredRoleList = Object.entries(UserSelectRoleMaster)
    .filter(([roleId, role]) => {
        if (user.role === 'ADMIN') { 
            return roleId === "3" || roleId === "4" 
        }
        return true 
    })
    .reduce((acc, [roleId, role]) => {
        (acc as Record<string, typeof role>)[roleId] = role
        return acc
    }, {} as Record<string, (typeof UserSelectRoleMaster)[keyof typeof UserSelectRoleMaster]>)

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
    const handleSelectRole = (value: string) => {
        setForm({ ...form, role: value })
    }

    const handelCloseModal = () => {

          setForm({
            username: '',
            email: '',
            password: '',
            phone:  '',
            role:'',
            status: false
        })
        onClose()
    }



    const handleSubmit = async () => {
      if (!form.username.trim() || !form.email.trim() || !form.password.trim() || !form.role) {
        await swalInstance.fire({
            icon: "warning",
            title: "กรอกข้อมูลไม่ครบ",
            text: "กรุณากรอกข้อมูลให้ครบถ้วน",
        })
        return
    }
        try {

            await createUserRequester(form)

            onUpdated()
            handelCloseModal()
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        }
    }


        const isFormValid = !!form.username.trim() && !!form.email.trim() && !!form.password.trim() && !!form.role

    if (!isOpen) return null

    return (
        <ModalBackgroundContainer>
            <ModalContainer>
                <ModalCard>
                    <ModalCardBody>
                        <Col lg={12}>
                            <label className="title">
                                Add User
                            </label>
                        </Col>

                        <Row style={{ marginTop: "12px", alignItems: "center" }}>
                            <Col lg={1.9}>
                                <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                    Name
                                </label>
                            </Col>
                            <Col lg={8}>
                                <Input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: "12px", alignItems: "center" }}>
                            <Col lg={1.9}>
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
                            <Col lg={1.9}>
                                <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                    Password
                                </label>
                            </Col>
                            <Col lg={8}>
                                <Input
                                    type="text"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: "12px", alignItems: "center" }}>
                            <Col lg={1.9}>
                                <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                    Role
                                </label>
                            </Col>
                            <Col lg={8}>
                                <SelectData
                                    placeholder="Role"
                                    value={form.role}
                                    setValue={handleSelectRole}
                                    jsonList={filteredRoleList}
                                    isSearchable={false}
                                    isClearable={false}
                                    hideSelectedOptions={false}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: '12px', alignItems: 'center' }}>
                            <Col lg={1.47}>
                                <label style={{ fontWeight: 500, color: '#b3b3b3' }}>Active</label>
                            </Col>
                            <Col lg={3}>
                                <input
                                    type='checkbox'
                                    name='status'
                                    checked={form.status}
                                    onChange={handleChange}
                                    style={{ transform: 'scale(1.2)' }}
                                />
                            </Col>
                        </Row>

                        <Row style={{ marginTop: '30px' }}>
                            <Col md={6}>
                                <div onClick={handelCloseModal}>
                                    <ButtonContainer $backgroundColor='#fff' $color='#d9d9d9'>
                                        ยกเลิก
                                    </ButtonContainer>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div
                                    onClick={isFormValid ? handleSubmit : undefined}
                                >
                                    <ButtonContainer
                                        $backgroundColor={isFormValid ? "#5D3A00" : "#ccc"}
                                        $color={!isFormValid ? palette.btnConfirmActive.color : palette.btnConfirm.color}
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


export const DeleteUserModal = ({ visible, onCancel, onConfirm }: any): JSX.Element => {
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
                                Are you sure you want to delete this User?<br />
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

const Input = styled.input<{ $isUrlError?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  background-color: #f9fafb;
  border: ${(props) =>
        props.$isUrlError === true
            ? "2px solid rgb(246, 43, 43)"
            : "1px solid #e5e7eb"};

  &:focus {
    outline: none;
  }
`;