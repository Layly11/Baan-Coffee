import { useRouter } from 'next/router'
import DataMutation from '@/utils/dataMutation'
import Badge from '@/components/commons/Badge'
import { Hidden } from 'react-grid-system'
import CustomerStatusMaster from '../../../constants/masters/CustomerStatus.Master.json'

export const Columns = (setRows: any): any[] => {
    const router = useRouter()
    return [
        {
            label: 'ID',
            key: 'id',
            width: '40%',
        },
        {
            label: 'Name',
            key: 'name',
            width: '30%',
        },
        {
            label: 'Email',
            key: 'email',
            width: '30%',
        },
        {
            label: 'Phone',
            key: 'phone',
            width: '30%',
        },
        {
            label: 'Status',
            key: 'verified',
            width: '30%',
            dataMutation: (row:any) => {
                const statusKey =  Number(row.verified) === 1 ? 'ACTIVE' : 'INACTIVE'
                const status = CustomerStatusMaster[statusKey]
                return (
                    <DataMutation
                        value={statusKey}
                        component={
                            <Badge
                                $color={status.color}
                                $backgroundcolor={status.backgroundColor}
                            >
                                <Hidden xs sm md>{status.label}</Hidden>
                                <Hidden lg xl xxl xxxl>{status.label.charAt(0)}</Hidden>
                            </Badge>
                        }
                        defaultValue='-'
                    />
                )
            }
        },
        {
            label: 'Action',
            key: 'actions',
            width: '40%',
        }
    ]
}