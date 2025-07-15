import Skeleton from "@/components/commons/skeleton";
import { nanoid } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import { JSX } from "react";
import styled from 'styled-components'



const Container = styled.div`
  height: auto;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #dcdfe6;
`

const TableWrapper = styled.div`
  display: grid;
  grid-template-columns: 20% 15% 15% 15% 15% 20%;
  grid-auto-rows: auto;
  overflow-y: auto;
  max-height: 65vh;
  border-collapse: collapse;

  @media (max-width: 768px) {
    max-height: 70vh;
  }

  @media (max-width: 480px) {
    max-height: 75vh;
  }

  ::-webkit-scrollbar {
    width: 10px;
  }
`

const HeaderCell = styled.div<{ $rowSpan?: number, $colSpan?: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  background-color: #fafbfd;
  color: #92a3b9;
  font-size: 1em;
  text-align: center;
  border-bottom: 1px solid #dcdfe6;
  border-right: 1px solid #dcdfe6; /* Border between columns */
  grid-row: span ${(props) => props.$rowSpan ?? 1};
  grid-column: span ${(props) => props.$colSpan ?? 1};

  &:last-child {
    border-right: none; /* Remove right border on the last column */
  }

   > i  {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    position: relative;
  }
  
  &:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
`

const Row = styled.div`
  display: contents;
  color: #0b2f5f;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fafbfd;
  }
`

const DataCell = styled.div<{ style?: React.CSSProperties }>`
  display: flex;
  justify-content: ${(props) => (props.style?.justifyContent === 'right' ? 'flex-end' : 'center')};
  align-items: center;
  padding: 10px;
  font-size: 0.875em;
  text-align: center;
  border-right: 1px solid #dcdfe6; /* Border between columns */
  border-bottom: 1px solid #dcdfe6; /* Border between rows */

  &:last-child {
    border-right: none; /* Remove right border on the last column */
  }
`

const Tooltip = styled.div`
visibility: hidden;
padding: 0 10px;
align-content: center;
height: 43px;
background-color: #FFFFFF;
color: #0C2F5F;
text-align: center;
border-radius: 15px;
border: 1px solid #E2E9F2;
position: absolute;
z-index: 1;
top: 6.5em;
transition: opacity 0.3s;

> i {
 padding-right: 10px;
 color:#A692EE
}

&::after {
  position: absolute;
  top: 100%; /* At the bottom of the tooltip */
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: black transparent transparent transparent;
}
`
interface TableColumn {
    label: string
    subLabel?: string
}
interface TableSummaryProps {
    isFetching: boolean
    columns: TableColumn[]
    rows: any
}

const TableInvertory = ({ isFetching, rows, columns }: TableSummaryProps): JSX.Element => {
    return (
        <Container>
            <TableWrapper>


                {columns.map((value) => (
                  <HeaderCell>{value.label}</HeaderCell>
                ))}

                {isFetching ? (
                    <Row>
                        {columns.map((_, index) => (
                            <DataCell key={`skeleton-${nanoid()}`}>
                                <Skeleton />
                            </DataCell>
                        ))}
                    </Row>
                ) : (
                    Array.isArray(rows) && rows.map((row: any, rowIndex: any) => {
                        return (
                            <Row key={row.id ?? rowIndex}>
                                <DataCell>{row.product_name !== null ? row.product_name : '-'}</DataCell>
                                <DataCell
                                    style={{
                                        color: '#2fa12d',
                                    }}
                                >
                                    {row.remaining !== null ? row.remaining : '-'}
                                </DataCell>
                                <DataCell
                                    style={{
                                        color: '#2fa12d',
                                    }}
                                >
                                    {row.unit !== null ? row.unit : '-'}
                                </DataCell>
                                <DataCell 
                                 style={{
                                        color:
                                            row.status === 'normal'
                                                ? '#1890ff'
                                                : row.status === 'low'
                                                    ? '#faad14'
                                                    : row.status === 'out_of_stock'
                                                        ? '#f5222d'
                                                        : '#0b2f5f',
                                    }}
                                >{row.alert_level !== null ? row.alert_level : '-'}</DataCell>
                                <DataCell
                                    style={{
                                        color:
                                            row.status === 'normal'
                                                ? '#1890ff'
                                                : row.status === 'low'
                                                    ? '#faad14'
                                                    : row.status === 'out_of_stock'
                                                        ? '#f5222d'
                                                        : '#0b2f5f',
                                    }}
                                >{row.status !== null ? row.status : '-'}</DataCell>
                                <DataCell>{dayjs(row.last_updated).format('YYYY-MM-DD')}</DataCell>
                            </Row>
                        )
                    })
                )}

            </TableWrapper>
        </Container>

    )
}

export default TableInvertory