import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import DataMutation from '@/utils/dataMutation'
import Badge from '@/components/commons/Badge'
import { Hidden } from 'react-grid-system'
import OrderStatusMaster from '../../../constants/masters/OrderStatusMaster.json'

export const Columns = (): any[] => {
    return [
        {
            label: 'ID',
            key: 'order_id',
            width: '50%',
        },
        {
            label: 'Order Time',
            key: 'time',
            width: '50%',
        },
        {
            label: 'Customer Name',
            key: 'customer_name',
            width: '50%',
        },
        {
            label: 'Method',
            key: 'method',
            width: '30%',
        },
        {
            label: 'Amount',
            key: 'total_price',
            width: '30%',
        },
        {
            label: 'Status',
            key: 'status',
            width: '40%',
            dataMutation: (row: any) => {
                const statusKey = row.status as keyof typeof OrderStatusMaster
                const status = OrderStatusMaster[statusKey]
                
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
            width: '20%',
        },
        {
            label: 'Invoice',
            key: 'actions',
            width: '20%',
        },
    ]
}