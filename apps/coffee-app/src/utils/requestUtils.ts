import { resolve } from 'path'
import axios from '../helpers/axios'
import { rejects } from 'assert'

export const fetchDashboardSummaryRequester = async (config: any): Promise<any> => {
 return await new Promise((resolve, rejects) => {
    axios.get('/api/dashboard/summary-list', config)
    .then((res) => {
        resolve(res.data)
    })
    .catch((err) => {
        rejects(err)
    })
 })
}


export const fetchDashboardOverViewsRequester = async (): Promise<any> => {
 return await new Promise((resolve, rejects) => {
    axios.get('/api/dashboard/overview')
    .then((res) => {
        resolve(res.data)
    })
    .catch((err) => {
        rejects(err)
    })
 })
}

export const fetchDashboardDetailRequester = async (id: any): Promise<any> => {
 return await new Promise((resolve, rejects) => {
    axios.get(`/api/dashboard/detail/${id}`)
    .then((res) => {
        resolve(res.data)
    })
    .catch((err) => {
        rejects(err)
    })
 })
}

export const fetchProductsDetailRequester = async (config: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get('/api/products', config)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const createProductRequester =  async (data: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.post('/api/products/create', data)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const updateProductRequester =  async (data: any, id: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.patch(`/api/products/item/${id}`, data)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}

export const deleteProductRequester =  async (id: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.delete(`/api/products/item/${id}`)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const fetchCategoryRequester = async (): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get('/api/products/categories')
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const AddCategoryRequester =  async (data: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.post('/api/products/categories/create', data)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const updateCategoryRequester =  async (data: any, id: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.patch(`/api/products/category/${id}`, data)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const deleteCategoryRequester =  async (id: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.delete(`/api/products/category/${id}`)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const fetchSizeProductRequester = async (): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get(`/api/products/sizes`)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const fetchOrderRequester = async (config:any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get(`/api/order`,config)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const updateOrderStatusRequester = async (id:any ,data: any ): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.post(`/api/order/status/${id}`, data)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}

export const updateCanceledOrderRequester = async (body:any ): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.post(`/api/order/status/cancel`,body)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}
export const fetchInvoiceRequester = async (id:any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get(`/api/order/invoice/${id}`)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}
export const fetchCustomerDataRequester = async (config: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get(`/api/customer`,config)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}
export const fetchCustomerOrderRequester = async (id: any,config: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get(`/api/customer/order/${id}`,config)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}
export const updateCustomerRequester = async (id: any,data: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.patch(`/api/customer/update/${id}`,data)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}
export const deleteCustomerRequester = async (id: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.delete(`/api/customer/delete/${id}`)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}
export const fetchUserDataRequester = async (config:any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.get(`/api/user/`,config)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}
export const updatUserRequester = async (id:any, data: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.patch(`/api/user/update/${id}`,data)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}


export const deleteUserRequester = async (id: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.delete(`/api/user/delete/${id}`)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}

export const createUserRequester = async (data: any): Promise<any> => {
    return await new Promise((resolve, rejects) => {
        axios.post(`/api/user/create`, data)
        .then((res) => {
            resolve(res.data)
        })
        .catch((err) => {
            rejects(err)
        })
    })
}



