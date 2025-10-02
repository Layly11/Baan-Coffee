import axios from "axios";
import Router from "next/router";



const instance = axios.create({
    withCredentials: true,
})
let isRefreshing = false
let failedQueue: Array<(token?: string) => void> = []
let storeDispatch: any = null
let accessToken: string | null = null

export const setStoreDispatch = (dispatch: any) => {
    storeDispatch = dispatch
}

export const setAccessToken = (token: string) => {
    accessToken = token
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

instance.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

instance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config
        const isLoginRequest = originalRequest.url?.includes('/authen/login')
         const isRefreshRequest = originalRequest.url?.includes('/authen/refresh-token')
         
        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isLoginRequest) {
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
                const res = await instance.post('/api/authen/refresh-token')
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
            } catch (refreshErr: any) {
                isRefreshing = false
                failedQueue = []
                if ((refreshErr.response?.status === 401 || refreshErr.response?.status  === 500) && Router.pathname !== '/login') {
                    accessToken = null;
                    delete instance.defaults.headers.common["Authorization"];
                    Router.push("/login");
                }

                return Promise.reject(refreshErr)
            }
        }
        return Promise.reject(error)

    }

)

export default instance