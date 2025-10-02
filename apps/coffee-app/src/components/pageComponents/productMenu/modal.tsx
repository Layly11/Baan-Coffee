import {
    ButtonContainer,
    ModalBackgroundContainer,
    ModalCard,
    ModalCardBody,
    ModalContainer,
} from "@/components/commons/modal";
import { JSX, useEffect, useState } from "react";
import { Col, Container, Row } from "react-grid-system";
import { FileUploader } from "react-drag-drop-files";
import Swal, { Alert } from "../../../helpers/sweetalert";
import styled from "styled-components";
import { SelectData } from "@/components/header/selectData";
import { AddCategoryRequester, deleteCategoryRequester, fetchCategoryRequester, updateCategoryRequester } from "@/utils/requestUtils";
import swalInstance from "../../../helpers/sweetalert";

interface AddProductModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    onChangeFile: (file: File) => void;
    editingItemId: number | null;
    setPreviewUrl: React.Dispatch<React.SetStateAction<string | null>>;
    previewUrl: string | null;
    setUploadedFileName: React.Dispatch<React.SetStateAction<string | null>>;
    uploadedFileName: string | null;
    productName: string;
    setProductName: React.Dispatch<React.SetStateAction<string>>;
    categories: any;
    setCategories: (categories: string[]) => void;
    categoryList: [string | number, { label: string }][];
    price: string | undefined;
    setNewPrice: React.Dispatch<React.SetStateAction<string>>
    isActive: boolean
    setIsActive: () => void
    disableConfirm: boolean
    setDisableConfirm: React.Dispatch<React.SetStateAction<boolean>>
    items: any
    setRemoveImage: React.Dispatch<React.SetStateAction<boolean>>
    newDescription: string
    setNewDescription: React.Dispatch<React.SetStateAction<string>>
    size: any;
    setSize: React.Dispatch<React.SetStateAction<string | string[] | undefined>>
    sizeList: [string | number, { label: string }][];
}

export const AddProductModal = ({
    visible,
    onClose,
    onConfirm,
    onChangeFile,
    setPreviewUrl,
    setUploadedFileName,
    uploadedFileName,
    previewUrl,
    editingItemId,
    productName,
    setProductName,
    categories,
    setCategories,
    categoryList,
    price,
    setNewPrice,
    isActive,
    setIsActive,
    disableConfirm,
    setDisableConfirm,
    items,
    setRemoveImage,
    newDescription,
    setNewDescription,
    size,
    setSize,
    sizeList
}: AddProductModalProps): JSX.Element => {
    const fileTypes = ["JPG", "PNG", "JPEG"];
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
    const allowedExtensions = ['.png', '.jpg', '.jpeg']

    useEffect(() => {
        if (!visible) {
            setPreviewUrl(null);
            setUploadedFileName(null);
        }
    }, [visible, size]);

    useEffect(() => {
        if (!visible) return;
        if (editingItemId !== null) {
            const item = items.find((i: any) => i.id === editingItemId)
            if (!item) {
                setDisableConfirm(true)
                return
            }
            const normalize = (arr: string[]) => (arr || []).map(String).sort();

            const originalSizes = normalize(item.sizes.map((s: any) => s.id));
            const currentSizes = normalize(size || []);

            const hasSizeChanged = JSON.stringify(originalSizes) !== JSON.stringify(currentSizes);

            // ถ้า size เป็น [] ให้ถือว่าไม่ผ่าน validate
            const isSizeValid = currentSizes.length > 0;

            const hasChanged =
                productName.trim() !== (item.name ?? '') ||
                String(categories) !== String(item.category_id ?? '') ||
                price !== String(item.price ?? '') ||
                isActive !== item.status ||
                previewUrl !== item.image_url ||
                newDescription !== item.description ||
                hasSizeChanged

            setDisableConfirm(!hasChanged || !isSizeValid)

        } else {
            const isCategoryValid = categoryList.some(([key]) => String(key) === String(categories));
            const isFilled =
                productName.trim() !== '' &&
                isCategoryValid &&
                price !== undefined &&
                price.trim() !== '' &&
                Array.isArray(size) &&
                size.length > 0

            setDisableConfirm(!isFilled)
        }
    }, [visible, productName, categories, price, isActive, editingItemId, items, setDisableConfirm, previewUrl, newDescription, size])

    useEffect(() => {
        return () => {
            if (previewUrl !== null && previewUrl !== undefined) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setRemoveImage(false)
        const file = e.target.files?.[0];
        if (file === null || file === undefined) return;
        validateImageFile(file)
            .then((isValidMagic) => {
                if (!isValidMagic) {
                    swalInstance.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'กรุณาอัปโหลดไฟล์ JPG หรือ PNG เท่านั้น',
                        showCloseButton: true,
                        showConfirmButton: false
                    })
                    return
                }
                onChangeFile(file)
                setUploadedFileName(file.name)
                setPreviewUrl(URL.createObjectURL(file))
            })
            .catch((err) => {
                console.log(err)
            })
    };

    const validateMagicNumber = async (file: File): Promise<boolean> => {
        return await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (reader.result instanceof ArrayBuffer) {
                    if (reader.result == null || reader.result.byteLength < 8) resolve(false)

                    const bytes = new Uint8Array(reader.result).subarray(0, 8)
                    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ')

                    if (file.type === 'image/png') {
                        resolve(hex.startsWith('89 50 4e 47 0d 0a 1a 0a'))
                    }

                    if (file.type === 'image/jpg') {
                        resolve(hex.startsWith('ff d8 ff'))
                    }

                    if (file.type === 'image/jpeg') {
                        resolve(hex.startsWith('ff d8 ff'))
                    }

                    resolve(false)
                } else {
                    resolve(false)
                }
            }
            reader.readAsArrayBuffer(file.slice(0, 8))
        })
    }

    const validateImageFile = async (file: File): Promise<boolean> => {
        if (!file.type.startsWith('image/')) return false
        if (file.size > 5 * 1024 * 1024) return false
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (fileExtension === undefined || !allowedExtensions.includes(`.${fileExtension}`)) {
            return false
        }
        const isValidMagic = await validateMagicNumber(file)
        return isValidMagic
    };

    const handleRemoveFile = (): void => {
        setRemoveImage(true)
        setUploadedFileName(null);
        setPreviewUrl(null);
        onChangeFile(null as unknown as File);
        if (previewUrl !== null && previewUrl !== undefined) {
            URL.revokeObjectURL(previewUrl);
        }
    };
    const handleFileUpload = async (file: any): Promise<void> => {
        setRemoveImage(false)
        if (!(await validateImageFile(file))) {
            swalInstance.fire({
                icon: 'error',
                title: 'Error',
                text: 'กรุณาอัปโหลดไฟล์ JPG หรือ PNG เท่านั้น',
                showCloseButton: true,
                showConfirmButton: false
            })
            return
        }
        onChangeFile(file);
        setUploadedFileName(file.name);
        setPreviewUrl(URL.createObjectURL(file));
    };

    if (!visible) return <></>;
    return (
        <ModalBackgroundContainer>
            <ModalContainer>
                <ModalCard>
                    <ModalCardBody>
                        <div style={{ position: "relative" }}>
                            <span className="close-btn" onClick={onClose} />
                            <Row>
                                <Col lg={12}>
                                    <label className="title">
                                        {editingItemId !== null && editingItemId !== undefined
                                            ? "Edit Product"
                                            : "Add Product"}
                                    </label>

                                    <div className="sub-title">Drag and drop your files here</div>
                                </Col>
                                <Col lg={12}>
                                    <FileUploader
                                        multiple={false}
                                        handleChange={handleFileUpload}
                                        name="file"
                                        types={fileTypes}
                                        maxSize={5} // MB
                                        onSizeError={() => {
                                            Swal.fire({
                                                icon: "error",
                                                title: "ขนาดไฟล์เกิน 5 MB",
                                                text: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5 MB",
                                                showCloseButton: true,
                                                showConfirmButton: false,
                                            });
                                        }}
                                        onTypeError={() => {
                                            Swal.fire({
                                                icon: "error",
                                                title: "Error",
                                                text: "กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น",
                                                showCloseButton: true,
                                                showConfirmButton: false,
                                            });
                                        }}
                                    >
                                        <div
                                            style={{
                                                border: "1px solid #f2f2f2",
                                                textAlign: "center",
                                                borderRadius: "12px",
                                                backgroundColor: "#f2f2f2",
                                                height: "200px",
                                            }}
                                        >
                                            {previewUrl === null || previewUrl === undefined ? (
                                                // ก่อนอัปโหลด
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        gap: "20px",
                                                        marginTop: "20px",
                                                    }}
                                                >
                                                    <div style={{ textAlign: "center" }}>
                                                        <img
                                                            src="/product/upload-banner-logo.png"
                                                            alt="Upload Icon"
                                                            style={{
                                                                width: "52px",
                                                                height: "52px",
                                                                marginBottom: "-10px",
                                                            }}
                                                        />
                                                        <div style={{ fontSize: "23px", fontWeight: 400 }}>
                                                            .png or .jpg
                                                        </div>
                                                        <div
                                                            className="sub-title"
                                                            style={{ fontSize: "14px", fontWeight: "400" }}
                                                        >
                                                            Recommended image size: 600 x 600 px Maximum file and without background
                                                            size: 5 MB.
                                                        </div>
                                                        <div
                                                            className="sub-title"
                                                            style={{ fontSize: "14px", fontWeight: "400" }}
                                                        >
                                                            You can also upload files by{" "}
                                                        </div>
                                                        <div style={{ marginTop: "8px" }}>
                                                            <label
                                                                style={{
                                                                    color: "#006CC5",
                                                                    cursor: "pointer",
                                                                    textDecoration: "underline",
                                                                }}
                                                            >
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={handleFileChange}
                                                                    style={{ display: "none" }}
                                                                />
                                                                clicking here
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // หลังอัปโหลด
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        border: "1px solid #E0E0E0",
                                                        borderRadius: "12px",
                                                        overflow: "hidden",
                                                        backgroundColor: "#FAFBFC",
                                                        height: "200px",
                                                    }}
                                                >
                                                    {/* ซ้าย: ข้อมูลไฟล์ */}
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            borderRight: "1px solid #E0E0E0",
                                                            padding: "24px",
                                                            textAlign: "center",
                                                            paddingTop: "40px",
                                                            backgroundColor: "#f2f2f2",
                                                        }}
                                                    >
                                                        <img
                                                            src="/product/file-banner.png"
                                                            alt="File Icon"
                                                            style={{
                                                                width: "auto",
                                                                height: "40px",
                                                                marginBottom: "10px",
                                                            }}
                                                        />
                                                        <div style={{ fontSize: "14px", fontWeight: 500 }}>
                                                            {uploadedFileName}
                                                            <i
                                                                className="fas fa-times-circle"
                                                                style={{
                                                                    marginLeft: 8,
                                                                    color: "#e53e3e",
                                                                    cursor: "pointer",
                                                                }}
                                                                title="Remove file"
                                                                onClick={handleRemoveFile}
                                                            />
                                                        </div>

                                                        <div style={{ fontSize: "13px", color: "#6B7280" }}>
                                                            You can also upload files by
                                                        </div>
                                                        <label
                                                            style={{
                                                                color: "#006CC5",
                                                                cursor: "pointer",
                                                                textDecoration: "underline",
                                                            }}
                                                        >
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                                style={{ display: "none" }}
                                                            />
                                                            clicking here
                                                        </label>
                                                    </div>

                                                    {/* ขวา: รูป Preview */}
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            padding: "16px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            paddingTop: "20px",
                                                        }}
                                                    >
                                                        <img
                                                            src={previewUrl}
                                                            alt="Preview"
                                                            style={{
                                                                width: "100%",
                                                                maxHeight: "160px",
                                                                objectFit: "contain",
                                                                borderRadius: "8px",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FileUploader>
                                </Col>
                            </Row>

                            <Row style={{ marginTop: "12px", alignItems: "center" }}>
                                <Col lg={2.5}>
                                    <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                        ProductName
                                    </label>
                                </Col>
                                <Col lg={5}>
                                    <Input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                    />
                                </Col>
                            </Row>
                            <Row style={{ marginTop: "12px", alignItems: "center" }}>
                                <Col lg={2}>
                                    <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                        Category
                                    </label>
                                </Col>
                                <Col lg={3.4}>
                                    <SelectData
                                        placeholder="Categories"
                                        value={categories}
                                        setValue={setCategories}
                                        jsonList={Object.fromEntries(categoryList)}
                                        isSearchable={false}
                                        isClearable={false}
                                        hideSelectedOptions={false}
                                    />
                                </Col>
                            </Row>
                            <Row style={{ marginTop: "12px", alignItems: "center" }}>
                                <Col lg={1.47}>
                                    <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                        Price
                                    </label>
                                </Col>
                                <Col lg={2}>
                                    <Input
                                        type="number"
                                        value={price}
                                        min={1}
                                        max={200}
                                        onPaste={(e) => {
                                            const pasted = e.clipboardData.getData('text');

                                            const isValid = /^\d+(\.\d{0,2})?$/.test(pasted);

                                            if (!isValid) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            const isNumberKey = /^\d$/.test(e.key)
                                            const allowedKeys = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete', '.']

                                            if (!isNumberKey && !allowedKeys.includes(e.key)) {
                                                e.preventDefault()
                                            }
                                        }}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                                const decimalPart = value.split('.')[1];
                                                if (decimalPart && decimalPart.length > 2) {
                                                    return;
                                                }

                                                const numericValue = parseFloat(value);
                                                if (!isNaN(numericValue)) {
                                                    if (numericValue < 1) {
                                                        setNewPrice('1');
                                                    } else if (numericValue > 200) {
                                                        setNewPrice('200');
                                                    } else {
                                                        setNewPrice(value);
                                                    }
                                                } else {
                                                    setNewPrice('');
                                                }
                                            }
                                        }}

                                    />
                                </Col>
                            </Row>

                            <Row style={{ marginTop: "12px", alignItems: "center" }}>
                                <Col lg={2.2}>
                                    <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                        Description
                                    </label>
                                </Col>
                                <Col lg={5.3}>
                                    <Input
                                        type="text"
                                        value={newDescription}
                                        maxLength={255}
                                        onChange={(e) => setNewDescription(e.target.value)}
                                    />
                                </Col>
                            </Row>

                            <Row style={{ marginTop: "12px", alignItems: "center" }}>
                                <Col lg={2}>
                                    <label style={{ fontWeight: 500, color: "#b3b3b3" }}>
                                        Size
                                    </label>
                                </Col>
                                <Col lg={7}>
                                    <SelectData
                                        placeholder="Size"
                                        value={size}
                                        setValue={setSize}
                                        isMulti
                                        jsonList={Object.fromEntries(sizeList)}
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
                                        checked={isActive}
                                        onChange={setIsActive}
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
                                        onClick={() => {
                                            if (!disableConfirm) {
                                                onConfirm()
                                            }
                                        }}
                                    >
                                        <ButtonContainer
                                            $backgroundColor={!disableConfirm ? palette.btnConfirmActive.backgroundColor : palette.btnConfirm.backgroundColor}
                                            $color={!disableConfirm ? palette.btnConfirmActive.color : palette.btnConfirm.color}
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
    );
};

export const DeleteProductModal = ({ visible, onCancel, onConfirm }: any): JSX.Element => {
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
                                Are you sure you want to delete this item?<br />
                                This action cannot be undone.
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



interface AddCategoriesModalProps {
    visible: boolean
    onClose: () => void
}
interface Category {
    id: number
    name: string
}

export const CategoryModal = ({ visible, onClose }: AddCategoriesModalProps): JSX.Element => {
    const [categories, setCategories] = useState<Category[]>([])
    const [editingId, setEditingId] = useState<number | null>(null)
    const [categoryName, setCategoryName] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const fetchCategoriesDetail = async () => {
        try {
            const res = await fetchCategoryRequester()
            if (res.data !== null) {
                const category = res.data.category
                setCategories(category)
            }
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        }
    }

    useEffect(() => {
        fetchCategoriesDetail()
    }, [])

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id)
        setCategoryName(cat.name)
        setModalVisible(true)
    }

    const handleConfirmAddCategory = async (): Promise<void> => {
        try {
            if (categoryName !== '' || categoryName !== null) {
                await AddCategoryRequester({ category_name: categoryName })
                fetchCategoriesDetail()
                setModalVisible(false)
                setCategoryName('')
                setEditingId(null)
            }
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        }
    }

    const handleConfirmEditCategory = async (): Promise<void> => {
        try {
            await updateCategoryRequester({ category_name: categoryName }, editingId)
            fetchCategoriesDetail()
            setModalVisible(false)
            setCategoryName('')
            setEditingId(null)
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        }
    }

    const handleDelete = async () => {
        try {
            await deleteCategoryRequester(deletingId)
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Category deleted successfully',
                showConfirmButton: false,
                showCloseButton: true
            })

        } catch (err: any) {
            console.error(err)


            const code = err?.response?.data?.res_code

            if (code === '4012') {
                Swal.fire({
                    icon: 'error',
                    title: 'Cannot delete',
                    text: "Category is in use by some products",
                    showCloseButton: true,
                    confirmButtonColor: '#5D3A00'
                })
            } else {
                Alert({ data: err })
            }
        } finally {
            fetchCategoriesDetail()
            setShowDeleteModal(false)
            setDeletingId(null)
        }
    }

    if (!visible) return <></>

    return (
        <ModalOverlay>
            <MainModalContainer>
                <ModalHeader>
                    <ModalTitle>Categories</ModalTitle>
                    <CloseButton onClick={() => onClose()}>×</CloseButton>
                </ModalHeader>

                <ModalContent>
                    <AddButton onClick={() => {
                        setCategoryName('')
                        setEditingId(null)
                        if (categories.length >= 4) {
                            swalInstance.fire({
                                icon: 'warning',
                                title: 'Limit เต็ม',
                                text: 'Category เต็ม categoy ห้ามเกิน 4 item',
                                showCloseButton: true,
                                showConfirmButton: false
                            })
                            return
                        }
                        setModalVisible(true)
                    }}>
                        <PlusIcon>+</PlusIcon>
                        Add Category
                    </AddButton>

                    <CategoriesList>
                        {categories.map((cat) => (
                            <CategoryItem key={cat.id}>
                                <CategoryName>{cat.name}</CategoryName>
                                <ActionButtons>
                                    <EditButton onClick={() => handleEdit(cat)}>
                                        Edit
                                    </EditButton>
                                    <DeleteButton onClick={() => {
                                        setDeletingId(cat.id)
                                        setShowDeleteModal(true)
                                    }}>
                                        Delete
                                    </DeleteButton>
                                </ActionButtons>
                            </CategoryItem>
                        ))}
                    </CategoriesList>
                </ModalContent>

                {/* Add/Edit Modal */}
                {modalVisible && (
                    <SubModalOverlay>
                        <SubModalContainer>
                            <SubModalHeader>
                                <SubModalTitle>
                                    {editingId ? 'Edit Category' : 'Add New Category'}
                                </SubModalTitle>
                            </SubModalHeader>

                            <SubModalContent>
                                <InputLabel>Category Name</InputLabel>
                                <StyledInput
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    placeholder="Enter category name"
                                />
                            </SubModalContent>

                            <SubModalFooter>
                                <CancelButton onClick={() => setModalVisible(false)}>
                                    Cancel
                                </CancelButton>
                                <SaveButton onClick={() => editingId ? handleConfirmEditCategory() : handleConfirmAddCategory()}>
                                    {editingId ? 'Update' : 'Save'}
                                </SaveButton>
                            </SubModalFooter>
                        </SubModalContainer>
                    </SubModalOverlay>
                )}

                <DeleteProductModal
                    visible={showDeleteModal}
                    onCancel={() => {
                        setShowDeleteModal(false)
                    }}
                    onConfirm={handleDelete}
                />
            </MainModalContainer>
        </ModalOverlay>
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

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`

const MainModalContainer = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    animation: modalAppear 0.3s ease-out;

    @keyframes modalAppear {
        from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
`

const ModalHeader = styled.div`
    padding: 24px 32px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #5D3A00 0%, #8B4513 100%);
    color: white;
`

const ModalTitle = styled.h2`
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: white;
`

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 32px;
    color: white;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }
`

const ModalContent = styled.div`
    padding: 32px;
    max-height: 60vh;
    overflow-y: auto;
`

const AddButton = styled.button`
    background: linear-gradient(135deg, #5D3A00 0%, #8B4513 100%);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(93, 58, 0, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
`

const PlusIcon = styled.span`
    font-size: 20px;
    font-weight: bold;
`

const CategoriesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
`

const CategoryItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid #e9ecef;
    transition: all 0.2s;

    &:hover {
        background: #f1f3f4;
        border-color: #5D3A00;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
`

const CategoryName = styled.span`
    font-size: 16px;
    font-weight: 500;
    color: #2c3e50;
`

const ActionButtons = styled.div`
    display: flex;
    gap: 8px;
`

const EditButton = styled.button`
    background: #A47148; /* กาแฟลาเต้ */
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background: #8C5C3A; /* กาแฟเข้มขึ้น */
        transform: translateY(-1px);
    }
`

const DeleteButton = styled.button`
    background: #B04A3F; /* แดงน้ำตาลอิฐ */
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        background: #923C33; /* แดงน้ำตาลเข้ม */
        transform: translateY(-1px);
    }
`
// Sub Modal (Add/Edit)
const SubModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1100;
`

const SubModalContainer = styled.div`
    background: white;
    border-radius: 16px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    width: 90%;
    max-width: 500px;
    overflow: hidden;
    animation: subModalAppear 0.3s ease-out;

    @keyframes subModalAppear {
        from {
            opacity: 0;
            transform: scale(0.8) translateY(-30px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
`

const SubModalHeader = styled.div`
    padding: 24px 32px;
    border-bottom: 1px solid #f0f0f0;
    background: #f8f9fa;
`

const SubModalTitle = styled.h3`
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
`

const SubModalContent = styled.div`
    padding: 32px;
`

const InputLabel = styled.label`
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #555;
`

const StyledInput = styled.input`
    width: 100%;
    padding: 16px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 16px;
    background: #f8f9fa;
    transition: all 0.2s;
    box-sizing: border-box;

    &:focus {
        outline: none;
        border-color: #5D3A00;
        background: white;
        box-shadow: 0 0 0 3px rgba(93, 58, 0, 0.1);
    }

    &::placeholder {
        color: #adb5bd;
    }
`

const SubModalFooter = styled.div`
    padding: 24px 32px;
    border-top: 1px solid #f0f0f0;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    background: #f8f9fa;
`

const CancelButton = styled.button`
    background: white;
    color: #6c757d;
    border: 2px solid #e9ecef;
    border-radius: 10px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #f8f9fa;
        border-color: #adb5bd;
        color: #495057;
    }
`

const SaveButton = styled.button`
    background: linear-gradient(135deg, #5D3A00 0%, #8B4513 100%);
    color: white;
    border: none;
    border-radius: 10px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(93, 58, 0, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
`
