import Head from "next/head"
import title from '../../constants/title.json'
import MainLayout from "@/components/layouts/mainLayout"
import { useSelector } from "react-redux"
import { UseSelectorProps } from "@/props/useSelectorProps"
import withAuthenticated from "@/hocs/withAuthenticated"
import { Col, Row } from "react-grid-system"
import styled from "styled-components";
import { useRouter } from "next/router"
import { Alert } from "@/helpers/sweetalert"
import { fetchInvoiceRequester } from "@/utils/requestUtils"
import { useEffect, useState } from "react"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PermissionMenuMaster from '../../constants/masters/PermissionMenuMaster.json'
import PermissionActionMaster from '../../constants/masters/PermissionActionMaster.json'
import { checkPermission } from "@/helpers/checkPermission"

const Container = styled.div`
  background: #f9fafb;
  min-height: 100vh;
  padding: 24px;
`;

const Card = styled.div`
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  padding: 32px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Status = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
  background: ${(p) =>
        p.status === "Delivered" ? "#d1fae5" : "#fef9c3"};
  color: ${(p) =>
        p.status === "Delivered" ? "#047857" : "#92400e"};
`;

const Table = styled.table`
  width: 100%;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  margin: 24px 0;

  th, td {
    padding: 12px 8px;
    text-align: left;
  }

  th:last-child, td:last-child {
    text-align: right;
  }

  tbody tr {
    border-top: 1px solid #f3f4f6;
  }
`;

const Summary = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 24px;

  .right {
    text-align: right;
  }

  .total {
    font-size: 18px;
    font-weight: 600;
    color: #ef4444;
    margin-top: 8px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Button = styled.button<{ variant?: "purple" | "green" | "blue" }>`
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  color: white;

  background: ${(p) =>
        p.variant === "purple"
            ? "#8b5cf6"
            : p.variant === "green"
                ? "#22c55e"
                : p.variant === "blue"
                    ? "#3b82f6"
                    : "#6b7280"};

  &:hover {
    opacity: 0.9;
  }
`;

// interface Invoice {
//     id: string,
//     status: string,
//     date: string,
//     customer: {
//         name: string,
//         email: string,
//         phone: string,
//         address: string,
//     },
//     products: [{ title: string, quantity: number, price: number }],
//     payment_method: string,
//     shipping_cost: number
//     discount: number,
// }
const OrdersPage = () => {
    const user = useSelector((state: UseSelectorProps) => state.user)
    const router = useRouter()
    const id = router.query.id as string
    const [invoice, setInvoice] = useState<any>()
    const [loading, setLoading] = useState(false)
    const fetchInvoiceData = async () => {
        setLoading(true)
        try {
            const res = await fetchInvoiceRequester(id)
            console.log("Data: ", res.data.invoice)
            setInvoice(res.data.invoice)
        } catch (err) {
            console.error(err)
            Alert({ data: err })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (id) {
            fetchInvoiceData()
        }
    }, [id])

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        const invoiceElement = document.getElementById("invoice-card");
        if (!invoiceElement) return;

        const canvas = await html2canvas(invoiceElement);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 10;
        const pdfWidth = pageWidth - margin * 2;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoice.id}.pdf`);
    };

    useEffect(() => {
        const page = PermissionMenuMaster.ORDER_MANAGEMENT
        const action = PermissionActionMaster.VIEW
        checkPermission({ user, page, action }, router)
    }, [user])

    if (loading || !invoice) {
        return <MainLayout isFetching={true}><p>Loading...</p></MainLayout>;
    }

    const totalAmount = invoice.amount
    const shippingCost = Number(totalAmount) - Number(invoice.products.reduce((acc: any, o: any) => acc + o.price, 0))

    return (
        <>
            <Head>
                <title>{title.ORDERS_TITLE}</title>
            </Head>

            <MainLayout isFetching={user === null} >
                <Card>
                    <div id="invoice-card">
                        <Header>
                            <div>
                                <h2 style={{ fontSize: "20px", fontWeight: 700 }}>INVOICE</h2>
                                <Status status={invoice.status}>{invoice.status}</Status>
                                <p style={{ fontSize: "14px", marginTop: "8px" }}>
                                    DATE:  {new Date(invoice.date).toLocaleDateString("en-US", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                                <p style={{ fontSize: "14px" }}>INVOICE NO: #{invoice.id}</p>
                            </div>
                            <div style={{ textAlign: "right", fontSize: "14px" }}>
                                <h3 style={{ fontWeight: 700, fontSize: "16px" }}>BAAN COFFE</h3>
                                <p>123 Sukhumvit Road, Watthana District, Bangkok 10110, Thailand</p>
                                <p>081-234-5678</p>
                                <p>baancoffee@gmail.com</p>
                            </div>
                        </Header>

                        {/* Customer */}
                        <div style={{ marginBottom: "24px" }}>
                            <h4 style={{ fontWeight: 600, fontSize: "15px" }}>INVOICE TO</h4>
                            <p>{invoice.customer.name}</p>
                            <p>{invoice.customer.email}</p>
                            <p>{invoice.customer.phone}</p>
                            <p>
                                {invoice.customer.address.house_no} {invoice.customer.address.street}, {invoice.customer.address.village}, {invoice.customer.address.city}, Thailand
                            </p>
                        </div>

                        <Table>
                            <thead>
                                <tr>
                                    <th>SR.</th>
                                    <th>PRODUCT TITLE</th>
                                    <th>QUANTITY</th>
                                    <th>ITEM PRICE</th>
                                    <th>AMOUNT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.products.map((p: any, i: any) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{p.title}</td>
                                        <td>{p.quantity}</td>
                                        <td>${p.price.toFixed(2)}</td>
                                        <td style={{ color: "#ef4444" }}>
                                            ${(p.price).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        <Summary>
                            <div>
                                <p style={{ fontWeight: 600 }}>PAYMENT METHOD</p>
                                <p>{invoice.payment_method === "qr" ? "QR Payment" : "Credit Card"}</p>
                            </div>
                            <div className="right">
                                <p>SHIPPING COST: ${shippingCost.toFixed(2)}</p>
                                <p className="total">TOTAL AMOUNT: ${totalAmount.toFixed(2)}</p>
                            </div>
                        </Summary>
                    </div>
                    <ButtonGroup>
                        <Button variant="purple" onClick={handleDownload} >Download Invoice</Button>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <Button variant="blue" onClick={handlePrint}>Print Invoice</Button>
                        </div>
                    </ButtonGroup>
                </Card>
            </MainLayout>
        </>
    )
}

export default withAuthenticated(OrdersPage)