import { useRouter } from 'next/router'
import DataMutation from '@/utils/dataMutation'
import Badge from '@/components/commons/Badge'
import { Hidden } from 'react-grid-system'
import CustomerStatusMaster from '../../../constants/masters/CustomerStatus.Master.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

export const Columns = (setRows: any,  handleOpenEdit: any, setShowDeleteModal: any, setDeletingId: any): any[] => {
    const router = useRouter()
    return [
        {
            label: 'ID',
            key: 'id',
            width: '10%',
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
            width: '30%',
            dataMutation: (row:any) => (
                  <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faMagnifyingGlass} color="#3B5475" size='lg' onClick={() => { router.push(`/customers/${row.id}`)}}/>
                    <i
                        className='fas fa-pen'
                        style={{ color: '#374151', cursor: 'pointer' }}
                        onClick={() => { handleOpenEdit(row)}}
                    />
                    <i
                        className='fas fa-ban'
                        style={{ color: '#EF4444', cursor: 'pointer' }}
                         onClick={() => {
                            setShowDeleteModal(true)
                            setDeletingId(row.id)
                        }}
                    />
                </div>
            )
        }
    ]
}