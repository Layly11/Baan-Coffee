import Badge from '@/components/commons/Badge'
import DataMutation from '@/utils/dataMutation'
import { useRouter } from 'next/router'
import { Hidden } from 'react-grid-system'
import CustomerStatusMaster from '../../../constants/masters/CustomerStatus.Master.json'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { resetPasswordRequester } from '@/utils/requestUtils'
import swalInstance, { Alert } from '@/helpers/sweetalert'
export const Columns = (setShowDeleteModal: any, setDeletingId: any, handleOpenEdit: any, canEditUser: any): any[] => {
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
            dataMutation: (row: any) => {
                const statusKey = Number(row.status) === 1 ? 'ACTIVE' : 'INACTIVE'
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
            dataMutation: (row: any) => (
                <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                    <i
                        className='fas fa-pen'
                        style={{ color: '#374151', cursor: 'pointer' }}
                        onClick={() => { handleOpenEdit(row) }}
                    />
                    <FontAwesomeIcon
                        icon={faKey}
                        style={{ color: '#2563EB', cursor: 'pointer' }}
                        title="Reset Password"
                        onClick={async () => {
                            try {
                                swalInstance.fire({
                                    title: "Processing...",
                                    text: "Resetting password...",
                                    allowOutsideClick: false,
                                    didOpen: () => {
                                        swalInstance.showLoading()
                                    }
                                })
                                const res = await resetPasswordRequester(row.id)
                                if (res.res_code === '0000') {
                                    swalInstance.fire({
                                        icon: "success",
                                        title: "Success",
                                        text: "Password reset successfully. User will need to set a new one.",
                                    })
                                } else {
                                    swalInstance.fire({
                                        icon: "error",
                                        title: "Failed",
                                        text: res.res_desc || "Something went wrong",
                                    })
                                }
                            } catch (err) {
                                Alert({ data: err })
                            }

                        }}
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