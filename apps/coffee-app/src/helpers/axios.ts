import axios from "axios";



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

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/authen/refresh-token') && accessToken) {
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