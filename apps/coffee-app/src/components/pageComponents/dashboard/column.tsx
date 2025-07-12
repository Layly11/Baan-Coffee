import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'

export const Columns = (): any[] => {
    const router = useRouter()
    return [
        {
            label: 'Date',
            key: 'date',
            width: '20%',
        },
        {
            label: 'TotalSale',
            key: 'totalSales',
            width: '20%',
        },
        {
            label: 'Order',
            key: 'orders',
            width: '15%',
        },
        {
            label: 'Shift',
            key: 'shift',
            width: '20%',
            dataMutation: (row: any) => {
                return `${row.shift.length} ${row.shift.map(
                    (shift: any) =>  `(${shift.employee_name})`
                )}`
            }
        },
        {
            label: 'Best Seller Menu',
            key: 'bestSeller',
            width: '15%',
        },
        {
            label: 'Notifications',
            key: 'notifications',
            width: '20%',
        },
        {
            label: 'View Details',
            key: 'viewDetails',
            width: '20%',
            dataMutation: (row: any) => {
                return (
                    <div
                     style={{
                cursor: 'pointer',
                color: '#1477F8'
              }}
              onClick={() => {
                router.push(`/dashboard/${row.id}`)
              }}
                    >
                        <FontAwesomeIcon icon={faMagnifyingGlass} color="#3B5475" size='lg' />
                    </div>
                )
            }
        },



    ]
}