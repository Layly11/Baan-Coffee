import Swal from './sweetalert'
import { type NextRouter } from 'next/router'

const allpath = {
    DASHBOARD: '/dashboard',
    Default: '/404'
}

const checkPermission = async ({
    user,
    page,
    action
}: {
    user: any
    page: string
    action: string
},
    router: NextRouter): Promise<void> => {
    if (user === null) {
        return
    }

    const hasPermission = user.permissions.some((permission: any) => {
        return permission.name === page && permission[action] === true
    })

    if (hasPermission === false) {
        Swal.fire({
            icon: 'error',
            title: 'Permission Denied',
            text: 'You do not have permission to access this page.',
            confirmButtonText: 'Return to Accessible Page',
            showCloseButton: true,
            showConfirmButton: false
        })
        const accessiblePermission = user.permissions.find((permission: any) => permission[action] === true)
        const accessiblePage = accessiblePermission !== undefined ? allpath[accessiblePermission.name as keyof typeof allpath] : allpath.Default
        router.push(accessiblePage)
    }
}

export { checkPermission }