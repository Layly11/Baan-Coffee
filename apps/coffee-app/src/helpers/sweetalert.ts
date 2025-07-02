import Swal from 'sweetalert2'
import { type AxiosError, isAxiosError } from 'axios'

const swalInstance = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  focusConfirm: true,
  customClass: {
    confirmButton: 'swal2-confirm',
    cancelButton: 'swal2-cancel'
  }
})

interface IAlert {
  data: any
}
export const Alert = (props: IAlert): void => {
  if (isAxiosError(props.data)) {
    const err: AxiosError = props.data

    const response = err.response as any
    const text = response?.data.res_desc

    if (err?.status !== 200) {
      swalInstance.fire({
        icon: 'error',
        title: 'Error',
        text,
        showConfirmButton: false,
        showCloseButton: true
      })
    }
  }
}

export default swalInstance
