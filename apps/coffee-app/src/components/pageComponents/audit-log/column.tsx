import React from 'react'
import auditLogMenuMaster from '../../../constants/masters/auditLogMenuMaster.json'
import auditLogActionMaster from '../../../constants/masters/auditLogActionMaster.json'
import { DateFormat, TimeFormat } from '../../formats/datetime'
export interface IResponseGetAuditLog {
  menu: string
  action: string
  source_type: string
  staff_id: string | undefined
  editor_name: string
  editor_role: string | undefined
  destination_type: string
  target_name: string
  detail: string
  created_at: string
}

export const Columns = (): any[] => {
  return [
    {
      label: 'Date',
      subLabel: 'Time',
      key: 'created_at',
      subKey: 'created_at',
      width: '15%',
      align: 'left',
      dataMutation: (row: IResponseGetAuditLog) => (
        <div>{DateFormat(row.created_at)}</div>
      ),
      subDataMutation: (row: IResponseGetAuditLog) => (
        <div>{TimeFormat(row.created_at)}</div>
      )
    },
    {
      label: 'Menu',
      width: '15%',
      dataMutation: (row: IResponseGetAuditLog) =>
        (row.menu !== null && ((auditLogMenuMaster[row.menu as keyof typeof auditLogMenuMaster]?.label ?? row.menu)))
    },
    {
      label: 'Action',
      key: 'action',
      width: '20%',
      dataMutation: (row: IResponseGetAuditLog) =>
        <div>{row.action !== null && (auditLogActionMaster[row.action as keyof typeof auditLogActionMaster]?.label ?? row.action)}</div>
    },
    {
      label: 'Staff Name',
      subLabel: 'Staff ID',
      key: 'editor_name',
      subKey: 'editor_id',
      width: '20%',
      dataMutation: (row: IResponseGetAuditLog) => {
        return (
          <div>{row.editor_name}</div>
        )
      },
      subDataMutation: (row: IResponseGetAuditLog) => {
        return (
          <div>{row.staff_id ?? '-'}</div>
        )
      }
    },
    {
      label: 'Customer Name',
      key: 'target_name',
      width: '20%'
    }
  ]
}
