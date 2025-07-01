import { type useRouter } from 'next/router'
import PORTAL_PATH_MENU_MASTER from '../constants/masters/PathMenuMaster.json'

export const redirectToDefaultPage = async (permissions: Array<{ name: string, view: boolean }> | undefined, router: ReturnType<typeof useRouter>): Promise<void> => {
  if (Array.isArray(permissions) && permissions.length > 0) {
    const viewablePermissions = permissions.filter(permission => permission.view)
    if (viewablePermissions.length > 0) {
      const defaultPage = PORTAL_PATH_MENU_MASTER[viewablePermissions[0]?.name as keyof typeof PORTAL_PATH_MENU_MASTER]
      if (defaultPage !== undefined) {
        router.push(defaultPage)
      }
    } else {
      router.replace({ pathname: PORTAL_PATH_MENU_MASTER.Default })
    }
  }
}
