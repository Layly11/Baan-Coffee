import {
    ButtonContainer,
    ModalBackgroundContainer,
    ModalCard,
    ModalCardBody,
    ModalContainer,
} from "@/components/commons/modal";
import { JSX, useEffect } from "react";
import { Col, Row } from "react-grid-system";
import { FileUploader } from "react-drag-drop-files";
import Swal from "../../../helpers/sweetalert";
import styled from "styled-components";
import { SelectData } from "@/components/header/selectData";

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
    items
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
            backgroundColor: "#a692ee",
        },
    };

    useEffect(() => {
        if (!visible) {
            setPreviewUrl(null);
            setUploadedFileName(null);
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) return;

        if (editingItemId !== null) {
            const item = items.find((i: any) => i.id === editingItemId)
            if (!item) {
                setDisableConfirm(true)
                return
            }

            const hasChanged =
                productName.trim() !== (item.name ?? '') ||
                String(categories) !== String(item.category_id ?? '') ||
                price !== String(item.price ?? '') ||
                isActive !== item.status ||
                previewUrl !== item.image_url

            setDisableConfirm(!hasChanged)

            console.log("PreviewURl: ", previewUrl)
            console.log("item.image_url: ", item.image_url)
        } else {
            const isFilled =
                productName.trim() !== '' &&
                categories !== null &&
                categories !== undefined &&
                categories !== '' &&
                price !== undefined &&
                price.trim() !== ''

            setDisableConfirm(!isFilled)
        }
    }, [visible, productName, categories, price, isActive, editingItemId, items, setDisableConfirm, previewUrl])

    useEffect(() => {
        return () => {
            if (previewUrl !== null && previewUrl !== undefined) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];
        if (file === null || file === undefined) return;
        if (!validateImageFile(file)) return;
        onChangeFile(file);
        setUploadedFileName(file.name);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const validateImageFile = (file: File): boolean => {
        if (!file.type.startsWith("image/")) {
            return false;
        }
        if (file.size > 2 * 1024 * 1024) {
            return false;
        }
        return true;
    };

    const handleRemoveFile = (): void => {
        setUploadedFileName(null);
        setPreviewUrl(null);
        onChangeFile(null as unknown as File);
        if (previewUrl !== null && previewUrl !== undefined) {
            URL.revokeObjectURL(previewUrl);
        }
    };
    const handleFileUpload = (file: File): void => {
        if (!validateImageFile(file)) return;
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
                                        maxSize={2} // MB
                                        onSizeError={() => {
                                            Swal.fire({
                                                icon: "error",
                                                title: "ขนาดไฟล์เกิน 2 MB",
                                                text: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 2 MB",
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
                                                            Recommended image size: 1060 x 475 px Maximum file
                                                            size: 2 MB.
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
