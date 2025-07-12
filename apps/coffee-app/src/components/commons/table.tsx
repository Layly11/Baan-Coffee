import React, { JSX, useEffect, useState } from "react";
import styled, { css } from 'styled-components'
import Skeleton from "./skeleton";
import { Hidden } from "react-grid-system";
import Pageginator from "./pagegination";
import Image from "next/image";


const Container = styled.div`
  height: auto;
  background-color: #fff;
  border: 1px solid #E2E9F2;
  border-radius: 20px;
  overflow: hidden;
`

const TableWrapper = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;  
  max-height: 65vh;
  
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

const Header = styled.div`
  display: flex;
  padding: 15px;
  color: #92a3b9;
  background-color: #fafbfd;
  border-bottom: 1px solid #f4f6f9;
  position: sticky;
  top: 0;
  z-index: 1;
`

const Row = styled.div`
  display: flex;
  padding: 10px 15px;
  color: #0b2f5f;
  border-bottom: 1px solid #f4f6f9;
  box-sizing: border-box;
  transition: background-color 0.2s;
  &:hover {
    background-color: #fafbfd;
  }
  ${(props) =>
    props.onClick !== undefined &&
    css`
      &:hover {
        cursor: pointer;
      }
    `}
`

const Column = styled.div<{ width?: string, $align?: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px 10px;
  word-break: break-word;
  font-size: 0.875em;

   ${(props) =>
    props.onClick !== undefined &&
    css`
      &:hover {
        cursor: pointer;
      }
    `}

  ${(props) => `
      flex-basis: ${props.width ?? 'auto'};
      text-align: ${props.$align ?? 'left'};
    `}
  > span:nth-child(2) {
    font-size: 0.875em;
    color: #92a3b9;
  }
`

const ContainerImg = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 15vh;

  > img {
    display: block;
    width: 25%;
    height: auto;
    opacity: 0.7;
    box-sizing: border-box;
    margin-left: -30px;
  }

  > p {
    color:rgba(94, 70, 48, 0.63);
    font-weight: 400;
    font-size: 30px;
  }
`

interface TableProps {
  isFetching: boolean
  total: number
  pageSize: number
  setPageSize?: (pageSize: number) => void
  page: number
  setPage: (page: number) => Promise<void>
  columns: Array<{
    label: string
    subLabel?: string
    key?: string
    width: string
    align?: string
    Mutatidataon?: (row: any) => React.ReactNode
    subKey?: string
    subDataMutation?: (row: any) => React.ReactNode
    isClickable?: boolean
    isHide?: boolean
  }>
  rows: any[]
  onClickRow?: (row: any) => void
  isSearch?: boolean
  isHidePagination?: boolean
}
const Table = ({
  isFetching,
  total,
  pageSize,
  setPageSize,
  page,
  setPage,
  columns,
  rows,
  onClickRow,
  isSearch,
  isHidePagination

}: TableProps): JSX.Element => {
  const [mockSize, setMockSize] = useState(10)
  const renderData = (column: any, row: any): React.ReactNode => {
    if (column.dataMutation != null) {
      return column.dataMutation(row)
    }

    const cellData = row[column.key]

    if (cellData !== undefined && cellData !== null) {
      if (cellData === '') return '-'
      return cellData
    }

    return '-'
  }

  const renderSubData = (column: any, row: any): React.ReactNode => {
    return column.subDataMutation != null
      ? column.subDataMutation(row)
      : (column.subKey !== undefined && column.subKey !== null && column.subKey !== '') &&
      row[column.subKey]
  }

  useEffect(() => {
    if (isFetching) {
      setMockSize(pageSize)
    }
  }, [isFetching])

  useEffect(() => {
    if (setPageSize !== null && setPageSize !== undefined) {
      setPageSize(pageSize)
    }
    if (isSearch === false) {
      setPage(0)
    }
  }, [pageSize])

  return (
    <div>
      <Container>
        <TableWrapper>
          <Header>
            {columns.map((column, index) => {
              if (column.isHide === true) return null
              return (
                <Column
                  width={column.width}
                  $align={column.align}
                  key={`column-${column.key}`}
                >
                  {column.label}
                  {column.subLabel !== undefined && (
                    <span style={{
                      fontSize: '0.875em'
                    }}
                    >{column.subLabel}
                    </span>
                  )}
                </Column>
              )
            })}
          </Header>

          {(total === 0 && isSearch === false && !isFetching) && (
            <Row>
              <Column width="100%" $align='right'>
                <p style={{
                  color: '#92a3b9',
                  marginRight: '30px'
                }}
                >0-0 of 0
                </p>
              </Column>
            </Row>
          )}

          {isFetching
            ? (
              <Row>
                {columns.map((column, columnIndex) => (
                  <Column
                    width={column.width}
                    $align={column.align}
                    key={`skeleton-${column.key}`}
                  >
                    <span>
                      <Skeleton />
                    </span>
                    {column.subKey !== undefined && (
                      <span>
                        <Skeleton />
                      </span>
                    )}
                  </Column>
                ))}
              </Row>
            )
            : (
              rows.map((row, rowIndex) => {
                return (
                  <Row
                    key={`${row.id ?? rowIndex}`}
                  >
                    {columns.map((column) => {
                      const isClickable = column.isClickable ?? true
                      if (column.isHide === true) return null
                      return (
                        <Column
                          width={column.width}
                          $align={column.align}
                          key={column.key ?? `${row.id ?? rowIndex}-${column.label}`}
                          onClick={(onClickRow != null && (isClickable ?? false)) ? () => { onClickRow(row) } : undefined}
                        >
                          <span>{renderData(column, row)}</span>
                          <Hidden xs sm md lg>
                            <span>{renderSubData(column, row)}</span>
                          </Hidden>
                        </Column>
                      )
                    })}
                  </Row>
                )
              })
            )
          }
        </TableWrapper>
      </Container>

      {
        (isHidePagination === true || total === 0)
          ? null
          : (
            <Pageginator
              total={total}
              pageSize={pageSize}
              page={page}
              setPage={setPage}
              mockSize={mockSize}
              setPageSize={setPageSize ?? setMockSize}
            />
          )
      }

      {isSearch === true && !isFetching && (
        <ContainerImg>
          <Image
            unoptimized
            width={0}
            height={0}
            onContextMenu={(e) => { e.preventDefault() }}
            src='/table/please-search.png'
            alt='please-search'
            priority
          />
          <p>ค้นหาเพื่อดูรายการ</p>
        </ContainerImg>
      )}


       {isSearch === false && total === 0 && !isFetching && (
        <ContainerImg>
          <Image
            unoptimized
            width={0}
            height={0}
            onContextMenu={(e) => { e.preventDefault() }}
            src='/table/no-results-found.png'
            alt='no-results-found'
            priority
          />
          <p>ไม่พบรายการ</p>
        </ContainerImg>
      )}
    </div>

  )
}

export default Table