import React, { JSX, useEffect } from 'react'


import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { UseSelectorProps } from '../props/useSelectorProps'
import axios from '@/helpers/axios'
import swalInstance from '../helpers/sweetalert'

const withAuthenticated = (Component: React.FC): React.FC => {
    const ComponentWithAuthenticated = (props: any): JSX.Element => {
        const router = useRouter()
        const dispatch = useDispatch()
        const user = useSelector((state: UseSelectorProps) => state.user)

        const handleFetchUserProfile = async (): Promise<void> => {
            try {
                const res = await axios.get('/api/authen/profile')
                const user = res.data.user
                dispatch({ type: 'SET_USER', payload: user })
            } catch (err: any) {
                if (err.response.status === 403) {
                    if (router.pathname === '/') {
                        router.push('/login')
                    } else {
                        swalInstance.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Forbidden'
                        })
                        router.push('/login')
                    }
                } else {
                    if (router.pathname === '/') {
                        router.push('/login')
                    } else {
                        swalInstance.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Unauthorized'

                        })
                        router.push('/login')
                    }
                }
            }
        }

        useEffect(() => {
            if (user === null) {
                handleFetchUserProfile()
            }
        }, [])

        return <Component {...props} />
    }
    return ComponentWithAuthenticated
}

export default withAuthenticated
