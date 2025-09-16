import Badge from '@/components/commons/Badge'
import DataMutation from '@/utils/dataMutation'
import { useRouter } from 'next/router'
import { Hidden } from 'react-grid-system'
import CustomerStatusMaster from '../../../constants/masters/CustomerStatus.Master.json'
export const Columns = (): any[] => {
    const router = useRouter()
    return [
        {
            label: 'Name',
            key: 'username',
            width: '30%',
        },
        {
            label: 'Email',
            key: 'email',
            width: '30%',
        },
        {
            label: 'Role',
            key: 'role',
            width: '30%',
        },
         {
            label: 'Joining Date',
            key: 'time',
            width: '30%',
        },
        {
            label: 'Last Login',
            key: 'last_login',
            width: '30%',
        },
        {
                   label: 'Status',
                   key: 'status',
                   width: '30%',
                   dataMutation: (row:any) => {
                       const statusKey =  Number(row.status) === 1 ? 'ACTIVE' : 'INACTIVE'
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
            key: 'verified',
            width: '30%',
        },
    ]
}