import { useRouter } from 'next/router'
import DataMutation from '@/utils/dataMutation'
import Badge from '@/components/commons/Badge'
import { Hidden } from 'react-grid-system'
import CustomerStatusMaster from '../../../constants/masters/CustomerStatus.Master.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import OrderStatusMaster from '../../../constants/masters/OrderStatusMaster.json'
import { SelectData } from '@/components/header/selectData'
import { updateCanceledOrderRequester, updateOrderStatusRequester } from '@/utils/requestUtils'

export const Columns = (setRows: any, canEditOrder: any): any[] => {
    const router = useRouter()
    return [
        {
            label: 'ORDER ID',
            key: 'order_id',
            width: '40%',
        },
        {
            label: 'Time',
            key: 'time',
            width: '30%',
        },
        {
            label: 'Shipping Address',
            key: 'shipping_address',
            width: '30%',
        },
        {
            label: 'Phone',
            key: 'phone',
            width: '30%',
        },
        {
            label: 'Method',
            key: 'payment_method',
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
            width: '30%',
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
            width: '40%',
            dataMutation: (row: any) => {
                const options = row.status === 'cancelled'
                    ? { [row.status]: OrderStatusMaster[row.status as keyof typeof OrderStatusMaster] }
                    : OrderStatusMaster;
                return (
                    <div style={{ width: '130px' }}>
                        <SelectData
                            value={row.status}
                            setValue={async (newVal: string) => {
                                const orderId = row.order_id;
                                await updateOrderStatusRequester(orderId, { new_status: newVal })
                                if (newVal === 'cancelled') {
                                    await updateCanceledOrderRequester({ order_id: orderId })
                                }
                                setRows((prev: any[]) =>
                                    prev.map((r) =>
                                        r.order_id === row.order_id ? { ...r, status: newVal } : r
                                    )
                                )
                            }}
                            placeholder='Select order'
                            jsonList={options}
                            isSearchable={false}
                            isMulti={false}
                            isClearable={false}
                        />
                    </div>

                )
            },
            isHide: canEditOrder === false
        },

    ]
}