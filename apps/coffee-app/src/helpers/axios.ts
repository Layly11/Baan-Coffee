import axios from "axios";



const instance = axios.create()
let isRefreshing = false
let failedQueue: Array<(token?: string) => void> = []
let storeDispatch: any = null

export const setStoreDispatch = (dispatch: any) => {
    storeDispatch = dispatch
}

export const setAccessToken = (token: string) => {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

function hasCookie(name: string): boolean {
    return document.cookie.split(';').some(c => c.trim().startsWith(`${name}=`))
}

instance.interceptors.request.use(config => {
    return config
})

instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/authen/refresh-token')) {
            originalRequest._retry = true

            if (isRefreshing) {
                return new Promise((resolve) => {
                    failedQueue.push((token?: string) => {
                        if (token) {
                            originalRequest.headers['Authorization'] = 'Bearer ' + token
                        }
                        resolve(instance(originalRequest))
                    })
                })
            }

            isRefreshing = true



            try {
                const hasRefreshToken = document.cookie.includes('authToken')
                if (!hasRefreshToken) {
                    isRefreshing = false
                    failedQueue = []
                    return instance(originalRequest)
                }

                const res = await instance.post('api/authen/refresh-token')
                const newAccessToken = res.data.data.newAccessToken

                setAccessToken(newAccessToken)

                if (storeDispatch) {
                    storeDispatch({ type: 'SET_USER_TOKEN', payload: newAccessToken })
                }

                failedQueue.forEach((cb) => cb(newAccessToken))
                failedQueue = []
                isRefreshing = false

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                return instance(originalRequest)
            } catch (refreshErr) {
                isRefreshing = false
                failedQueue = []
                return Promise.reject(refreshErr)
            }
        }
        return Promise.reject(error)

    }

)

export default instance