import { JSX, useEffect, useState } from 'react'
import { Col, Row, Container } from 'react-grid-system'
import { ButtonContainer, ModalBackgroundContainer, ModalCard, ModalCardBody, ModalContainer } from '@/components/commons/modal'
import styled from 'styled-components'
import { Alert } from '@/helpers/sweetalert'

interface Category {
    id: number
    name: string
}

export default function CategoryPage(): JSX.Element {
    const [categories, setCategories] = useState<Category[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [categoryName, setCategoryName] = useState('')
    const [modalVisible, setModalVisible] = useState(false)

    const fetchCategories = async () => {
        
    }

    useEffect(() => {
        fetchCategories()
    }, [categories])


    const handleEdit = (cat: Category) => {
        setEditingId(cat.id)
        setCategoryName(cat.name)
        setModalVisible(true)
    }

    //   const handleDelete = async (id: number) => {
    //     const confirm = await Alert.confirm('Delete this category?')
    //     if (!confirm) return

    //     // API call here
    //     setCategories((prev) => prev.filter((c) => c.id !== id))
    //   }

    const handleSubmit = async () => {
        if (categoryName.trim() === '') return

        if (editingId) {
            // API PUT
            setCategories((prev) =>
                prev.map((c) => (c.id === editingId ? { ...c, name: categoryName } : c))
            )
        } else {
            // API POST
            const newId = Math.max(...categories.map((c) => c.id)) + 1
            setCategories((prev) => [...prev, { id: newId, name: categoryName }])
        }

        setModalVisible(false)
        setCategoryName('')
        setEditingId(null)
    }


    return (
        <Container>
            <Row style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2>Categories</h2>
                <button
                    style={{ padding: '8px 16px', backgroundColor: '#5D3A00', color: '#fff', borderRadius: 8 }}
                    onClick={() => {
                        setCategoryName('')
                        setEditingId(null)
                        setModalVisible(true)
                    }}
                >
                    + Add Category
                </button>
            </Row>

            {categories.map((cat) => (
                <Row key={cat.id} style={{ marginBottom: 10, alignItems: 'center' }}>
                    <Col sm={6}>{cat.name}</Col>
                    <Col sm={6} style={{ textAlign: 'right' }}>
                        <button style={{ marginRight: 8 }} onClick={() => handleEdit(cat)}>
                            Edit
                        </button>
                        <button>Delete</button>
                    </Col>
                </Row>
            ))}

            {modalVisible && (
                <ModalBackgroundContainer>
                    <ModalContainer>
                        <ModalCard>
                            <ModalCardBody>
                                <h3 style={{ marginBottom: 10 }}>{editingId ? 'Edit' : 'Add'} Category</h3>
                                <Input
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder='Enter category name'
                                />
                                <Row style={{ marginTop: 20 }}>
                                    <Col md={6}>
                                        <div onClick={() => setModalVisible(false)}>
                                            <ButtonContainer $backgroundColor='#fff' $color='#d9d9d9'>Cancel</ButtonContainer>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div onClick={handleSubmit}>
                                            <ButtonContainer $backgroundColor='#5D3A00' $color='#fff'>Confirm</ButtonContainer>
                                        </div>
                                    </Col>
                                </Row>
                            </ModalCardBody>
                        </ModalCard>
                    </ModalContainer>
                </ModalBackgroundContainer>
            )}
        </Container>
    )
}

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border-radius: 12px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;

  &:focus {
    outline: none;
  }
`
