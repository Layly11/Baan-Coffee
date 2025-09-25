import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'next/router'
import DataMutation from '@/utils/dataMutation'
import Badge from '@/components/commons/Badge'
import { Hidden } from 'react-grid-system'
import ProductStatusMaster from '../../../constants/masters/ProductStatusMaster.json'

export const Columns = (
    handleEditItem?: (id: number) => void,
    handleDeleteItem?: (id: number) => void,
    canEditProduct?: any
): any[] => {
    const router = useRouter()
    return [
        {
            label: 'ProductName',
            key: 'name',
            width: '50%',
        },
        {
            label: 'Categories',
            key: 'category_name',
            width: '30%',
        },
        {
            label: 'Image',
            key: 'image_url',
            width: '50%',
            dataMutation: (row: any) => (
                row.image_url ? (
                    <img
                        src={row.image_url}
                        alt='product'
                        style={{ width: '200px', height: 'auto', borderRadius: '8px' }}
                    />
                ) : (
                    <div
                        style={{
                            width: '200px',
                            height: '150px',
                            border: '1px dashed #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            color: '#888',
                            fontStyle: 'italic'
                        }}
                    >
                        No Image
                    </div>
                )
            )
        },
        {
            label: 'Price',
            key: 'price',
            width: '30%',
        },
        {
            label: 'Description',
            key: 'description',
            width: '50%',
        },
        {
            label: 'Sizes',
            key: 'sizes',
            width: '30%',
            dataMutation: (row: any) => {
                return(
                     `${row.sizes.map(((s:any) => s.name))}`
                )
            }
        },
        {
            label: 'Status',
            key: 'status',
            width: '40%',
            dataMutation: (row: any) => {
                const statusKey = row.status === true ? 'ACTIVE' : 'INACTIVE'
                const status = ProductStatusMaster[statusKey]

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
            label: '',
            key: 'actions',
            width: '20%',
            dataMutation: (row: any) => (
                <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
                    <i
                        className='fas fa-pen'
                        style={{ color: '#374151', cursor: 'pointer' }}
                        onClick={() => handleEditItem?.(Number(row.id))}
                    />
                    <i
                        className='fas fa-ban'
                        style={{ color: '#EF4444', cursor: 'pointer' }}
                         onClick={() => handleDeleteItem?.(Number(row.id))}
                    />
                </div>
            ),
            isHide: canEditProduct === false
        },
    ]
}