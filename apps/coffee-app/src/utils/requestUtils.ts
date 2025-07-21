import { resolve } from 'path'
import axios from '../helpers/axios'
import { rejects } from 'assert'

export const fetchDashboardSummary = async (config: any): Promise<any> => {
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


export const fetchDashboardOverViews = async (): Promise<any> => {
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

export const fetchDashboardDetail = async (id: any): Promise<any> => {
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

export const fetchProductsDetail = async (config: any): Promise<any> => {
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

export const createProduct =  async (data: any): Promise<any> => {
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


export const updateProduct =  async (data: any, id: any): Promise<any> => {
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

