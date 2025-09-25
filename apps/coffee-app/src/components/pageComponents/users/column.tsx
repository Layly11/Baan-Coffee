import Badge from '@/components/commons/Badge'
import DataMutation from '@/utils/dataMutation'
import { useRouter } from 'next/router'
import { Hidden } from 'react-grid-system'
import CustomerStatusMaster from '../../../constants/masters/CustomerStatus.Master.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
export const Columns = (setShowDeleteModal: any, setDeletingId: any, handleOpenEdit:any, canEditUser:any): any[] => {
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
            label: 'Recent Login',
            key: 'recent_login',
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
            key: 'action',
            width: '30%',
            dataMutation: (row:any) => (
                              <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
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
                        ),
            isHide: canEditUser === false
        },
    ]
}