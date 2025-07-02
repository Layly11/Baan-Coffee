import React, { JSX, useEffect } from 'react'


import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import {UseSelectorProps} from '../props/useSelectorProps'
import axios from 'axios'

const withAuthenticated = (Component: React.FC): React.FC => {
    const ComponentWithAuthenticated = (props: any): JSX.Element => {
        const router = useRouter()
        const dispatch = useDispatch()
        const user = useSelector((state: UseSelectorProps) => state.user)

        const handleFetchUserProfile = async (): Promise<void> => {
            try {
                const res = await axios.get('/api/authen/profile')
            }
        }
    }
}